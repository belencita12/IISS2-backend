import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { DateService } from '@features/global-module/date/date.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { NotificationMapper } from './notification.mapper';
import { CreateNotificationToUserDto } from './dto/create-notification-to-user.dto';
import { NotificationScope } from '@prisma/client';
import { CreateNotificationBroadcastDto } from './dto/create-notification-broadcast.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationFilter } from './notification.filter';
import { NotificationGateway } from './notification.gateway';
import { NotificationEmailService } from './notification-email.service';

@Injectable()
export class NotificationService {
	constructor(
		private readonly db: PrismaService,
		private readonly date: DateService,
		private readonly gateway: NotificationGateway,
		private readonly notificationFilter: NotificationFilter,
		private readonly notificationEmailService: NotificationEmailService,
	) {}

	async getAll(query: NotificationQueryDto, user: TokenPayload) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const isAdmin = user.roles.includes('ADMIN');
		const where = this.notificationFilter.getWhere(baseWhere, query, user);
		const [data, count] = await Promise.all([
			this.db.notification.findMany({
				where,
				include: {
					userNotifications: {
						where: { userId: isAdmin ? query.userId : user.id },
					},
				},
				...this.db.paginate(query),
			}),
			this.db.notification.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total: count,
			data: data.map((n) => NotificationMapper.toDto(n)),
		});
	}

	async markAsReadOne(id: number, user: TokenPayload) {
		const isNotifiExists = await this.db.notification.isExists({ id });
		if (!isNotifiExists) {
			throw new NotFoundException('La notificacion no existe');
		}
		await this.db.userNotification.upsert({
			where: { userId_notificationId: { userId: user.id, notificationId: id } },
			update: { readAt: this.date.getToday(true), isRead: true },
			create: {
				userId: user.id,
				notificationId: id,
				readAt: this.date.getToday(true),
				isRead: true,
			},
		});
	}

	async markAsReadAll(user: TokenPayload) {
		await this.db.userNotification.updateMany({
			where: { userId: user.id, readAt: null },
			data: {
				readAt: this.date.getToday(true),
				isRead: true,
			},
		});

		const unreadBroadcasts = await this.db.notification.findMany({
			where: {
				scope: 'BROADCAST',
				deletedAt: null,
				userNotifications: {
					none: { userId: user.id },
				},
			},
			select: { id: true },
		});

		if (unreadBroadcasts.length > 0) {
			await this.db.userNotification.createMany({
				data: unreadBroadcasts.map((notification) => ({
					userId: user.id,
					notificationId: notification.id,
					isRead: true,
					readAt: this.date.getToday(true),
					arrivalDate: new Date(),
				})),
				skipDuplicates: true,
			});
		}
	}

	async createToUser(userId: number, dto: CreateNotificationToUserDto) {
		const extraFields = await this.validateExtraFields(userId, dto);
		const userNotif = await this.db.userNotification.create({
			include: { notification: true },
			data: {
				user: { connect: { id: userId } },
				notification: { create: { ...dto, scope: NotificationScope.TO_USER } },
			},
		});
		const message = NotificationMapper.toDto(userNotif.notification);
		this.notificationEmailService.sendEmail({
			...message,
			...extraFields,
		});
		const userIdStr = userId.toString();
		this.gateway.sendToUser(userIdStr, message);
	}

	async createBroadcast(dto: CreateNotificationBroadcastDto) {
		const notification = await this.db.notification.create({
			data: { ...dto, scope: NotificationScope.BROADCAST },
		});
		const users = await this.db.user.findMany({
			select: { id: true, email: true, roles: { select: { name: true } } },
			where: { deletedAt: null },
		});
		const message = NotificationMapper.toDto(notification);
		for (const user of users) {
			this.notificationEmailService.sendEmail({
				...message,
				userEmail: user.email,
				userRoles: user.roles,
			});
		}
		this.gateway.sendBroadcast(message);
		return notification;
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
		let clientId: number | undefined = undefined;
		let petId: number | undefined = undefined;

		const user = await this.db.user.findUnique({
			where: { id: userId },
			select: { email: true, roles: { select: { name: true } } },
		});
		if (!user) throw new NotFoundException('Usuario no encontrado');
		const userEmail = user.email;
		const userRoles = user.roles;

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
				select: {
					expectedDate: true,
					petId: true,
					pet: { select: { clientId: true } },
				},
			});
			if (!isVaccExists)
				throw new NotFoundException(
					'Registro de vacuna no encontrado o ya fue aplicado',
				);
			vaccineRegistryDate =
				isVaccExists.expectedDate.toLocaleDateString('es-Py');
			clientId = isVaccExists.pet.clientId;
			petId = isVaccExists.petId;
		}

		return {
			userEmail,
			userRoles,
			clientId,
			petId,
			date: vaccineRegistryDate || appointmentDate,
		};
	}
}
