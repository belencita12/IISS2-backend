import { Notification, UserNotification } from '@prisma/client';
import { INotificationMessage } from './notification.types';

export interface NotificationEntity extends Notification {
	userNotifications?: UserNotification[];
}

export class NotificationMapper {
	static toDto(data: NotificationEntity): INotificationMessage {
		return {
			id: data.id,
			scope: data.scope,
			arrivalDate: new Date(),
			title: data.title,
			description: data.description,
			appointmentId: data.appointmentId ?? undefined,
			vaccineRegistryId: data.vaccineRegistryId ?? undefined,
			isRead: data.userNotifications
				? data.userNotifications.length > 0 && data.userNotifications[0].isRead
				: false,
			type: data.type,
		};
	}
}
