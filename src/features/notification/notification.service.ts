import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DateService } from '@features/global-module/date/date.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { NotificationGateway } from './notification.gateway';
import { NotificationMapper } from './notification.mapper';
import { CreateNotificationToUserDto } from './dto/create-notification-to-user.dto';
import { NotificationScope } from '@prisma/client';
import { CreateNotificationBroadcastDto } from './dto/create-notification-broadcast.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationFilter } from './notification.filter';
import { EmailService } from '@features/global-module/email/email.service';
import {
	getNotificationTemplate,
	NotificationTemplateParams,
} from '@features/global-module/email/templates/email-notification';

@Injectable()
export class NotificationService {
	constructor(
		private readonly db: PrismaService,
		private readonly email: EmailService,
		private readonly dateService: DateService,
		private readonly gateway: NotificationGateway,
		private readonly notificationFilter: NotificationFilter,
	) {}

	async getAll(query: NotificationQueryDto, user: TokenPayload) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where = this.notificationFilter.getWhere(baseWhere, query, user);
		const [data, count] = await Promise.all([
			this.db.userNotification.findMany({
				where,
				include: { notification: true },
				...this.db.paginate(query),
			}),
			this.db.userNotification.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total: count,
			data: data.map((un) => NotificationMapper.toDto(un)),
		});
	}

	async markAsReadOne(id: number, user: TokenPayload) {
		const isNotificationExists = await this.db.userNotification.isExists({
			userId_notificationId: { userId: user.id, notificationId: id },
			readAt: null,
		});
		if (!isNotificationExists) {
			throw new NotFoundException('Notificacion no encontrada o ya fue leida');
		}
		await this.db.userNotification.update({
			where: { userId_notificationId: { userId: user.id, notificationId: id } },
			data: { readAt: this.dateService.getToday(true), isRead: true },
		});
	}

	async markAsReadAll(user: TokenPayload) {
		await this.db.userNotification.updateMany({
			where: { userId: user.id, readAt: null },
			data: { readAt: this.dateService.getToday(true), isRead: true },
		});
	}

	async createToUser(userId: number, dto: CreateNotificationToUserDto) {
		const { userEmail, vaccineRegistryDate, appointmentDate } =
			await this.validateExtraFields(userId, dto);
		const notification = await this.db.userNotification.create({
			include: { notification: true },
			data: {
				user: { connect: { id: userId } },
				notification: { create: { ...dto, scope: NotificationScope.TO_USER } },
			},
		});
		await this.sendNotificationEmail(userEmail, {
			...dto,
		});
		const message = NotificationMapper.toMessageFromEntity(notification);
		const userIdStr = userId.toString();
		this.gateway.sendToUser(userIdStr, message);
	}

	async createBroadcast(dto: CreateNotificationBroadcastDto) {
		const notification = await this.db.notification.create({
			data: { ...dto, scope: NotificationScope.BROADCAST },
		});

		const users = await this.db.user.findMany({
			select: { id: true, email: true },
			where: { deletedAt: null },
		});

		const userNotifications = users.map((user) => ({
			userId: user.id,
			notificationId: notification.id,
		}));

		await this.db.userNotification.createMany({
			data: userNotifications,
			skipDuplicates: true,
		});

		const message = NotificationMapper.toMessageFromNotification(notification);
		for (const user of users) await this.sendNotificationEmail(user.email, dto);

		this.gateway.sendBroadcast(message);
		return notification;
	}

	async sendNotificationEmail(to: string, params: NotificationTemplateParams) {
		await this.email.sendEmail({
			to,
			subject: params.title,
			content: getNotificationTemplate(params),
			type: 'html',
		});
	}

	private async validateExtraFields(
		userId: number,
		dto: CreateNotificationToUserDto,
	) {
		if (dto.vaccineRegistryId && dto.appointmentId) {
			throw new BadRequestException(
				'No se puede enviar notificaciones con cita y registro de vacuna',
			);
		}

		let vaccineRegistryDate: string | undefined = undefined;
		let appointmentDate: string | undefined = undefined;

		const user = await this.db.user.findUnique({
			where: { id: userId },
			select: { email: true },
		});
		if (!user) throw new NotFoundException('Usuario no encontrado');
		const userEmail = user.email;

		if (dto.appointmentId) {
			const appointment = await this.db.appointment.findUnique({
				where: { id: dto.appointmentId, pet: { client: { userId } } },
				select: { designatedDate: true },
			});
			if (!appointment) throw new NotFoundException('Cita no encontrada');
			appointmentDate = appointment.designatedDate.toLocaleDateString('es-Py');
		}

		if (dto.vaccineRegistryId) {
			const isVaccExists = await this.db.vaccineRegistry.findUnique({
				where: {
					id: dto.vaccineRegistryId,
					applicationDate: null,
					pet: { client: { userId } },
				},
				select: { expectedDate: true },
			});
			if (!isVaccExists)
				throw new NotFoundException(
					'Registro de vacuna no encontrado o ya fue aplicado',
				);
			vaccineRegistryDate =
				isVaccExists.expectedDate.toLocaleDateString('es-Py');
		}

		return { userEmail, vaccineRegistryDate, appointmentDate };
	}
}
