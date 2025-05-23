import { Notification, UserNotification } from '@prisma/client';
import { NotificationDto } from './dto/notification.dto';
import { INotificationMessage } from './notification.types';

export interface NotificationEntity extends UserNotification {
	notification: Notification;
}

export class NotificationMapper {
	static toDto(data: NotificationEntity): NotificationDto {
		return {
			id: data.notification.id,
			title: data.notification.title,
			description: data.notification.description,
			isRead: data.isRead,
			type: data.notification.type,
			scope: data.notification.scope,
			appointmentId: data.notification.appointmentId ?? undefined,
			vaccineRegistryId: data.notification.vaccineRegistryId ?? undefined,
			userId: data.userId ?? undefined,
			arrivalDate: data.arrivalDate ?? undefined,
		};
	}

	static toMessageFromEntity(data: NotificationEntity): INotificationMessage {
		return {
			id: data.notification.id,
			scope: data.notification.scope,
			arrivalDate: data.arrivalDate!,
			title: data.notification.title,
			description: data.notification.description,
			isRead: data.isRead,
			type: data.notification.type,
		};
	}

	static toMessageFromNotification(data: Notification): INotificationMessage {
		return {
			id: data.id,
			scope: data.scope,
			arrivalDate: new Date(),
			title: data.title,
			description: data.description,
			isRead: false,
			type: data.type,
		};
	}
}
