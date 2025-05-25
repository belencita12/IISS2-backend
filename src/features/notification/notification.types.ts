import { NotificationScope, NotificationType } from '@prisma/client';

export interface ICreateNotification {
	title: string;
	description: string;
	scope: NotificationScope;
	type: NotificationType;
	appointmentId?: number;
	vaccineRegistryId?: number;
	userId?: number;
}

export interface INotificationMessage {
	id: number;
	title: string;
	description: string;
	isRead: boolean;
	appointmentId?: number;
	vaccineRegistryId?: number;
	scope: NotificationScope;
	type: NotificationType;
	arrivalDate: Date;
}

export enum NotificationEvents {
	NOTIFICATION = 'notification',
}
