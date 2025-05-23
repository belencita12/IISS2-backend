import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class NotificationService {
	constructor(
		private readonly db: PrismaService,
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

	async createToUser(userId: number, dto: CreateNotificationToUserDto) {
		await this.validateExtraFields(userId, dto);
		const notification = await this.db.userNotification.create({
			include: { notification: true },
			data: {
				user: { connect: { id: userId } },
				notification: { create: { ...dto, scope: NotificationScope.TO_USER } },
			},
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
			select: { id: true },
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
		this.gateway.sendBroadcast(message);
		return notification;
	}
	private async validateExtraFields(
		userId: number,
		dto: CreateNotificationToUserDto,
	) {
		if (dto.appointmentId) {
			const isAppExists = await this.db.appointment.isExists({
				id: dto.appointmentId,
			});
			if (!isAppExists) throw new NotFoundException('Cita no encontrada');
		}

		if (dto.vaccineRegistryId) {
			const isUserExists = await this.db.user.isExists({ id: userId });
			if (!isUserExists) throw new NotFoundException('Usuario no encontrado');
		}
	}
}
