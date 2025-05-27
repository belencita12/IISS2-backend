import { Notification, UserNotification } from '@prisma/client';
import { INotificationMessage } from './notification.types';

export interface NotificationEntity extends UserNotification {
	notification: Notification;
}

export class NotificationMapper {
	static toDto(data: NotificationEntity): INotificationMessage {
		return {
			id: data.notification.id,
			title: data.notification.title,
			description: data.notification.description,
			isRead: data.isRead,
			type: data.notification.type,
			scope: data.notification.scope,
			appointmentId: data.notification.appointmentId ?? undefined,
			vaccineRegistryId: data.notification.vaccineRegistryId ?? undefined,
			arrivalDate: data.arrivalDate ?? new Date(),
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
			appointmentId: data.notification.appointmentId ?? undefined,
			vaccineRegistryId: data.notification.vaccineRegistryId ?? undefined,
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
			appointmentId: data.appointmentId ?? undefined,
			vaccineRegistryId: data.vaccineRegistryId ?? undefined,
			isRead: false,
			type: data.type,
		};
	}
}
