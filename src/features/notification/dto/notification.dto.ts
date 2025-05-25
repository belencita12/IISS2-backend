import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationScope, NotificationType } from '@prisma/client';

export class NotificationDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	title: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	isRead: boolean;

	@ApiProperty({ enum: NotificationType })
	type: NotificationType;

	@ApiProperty({ enum: NotificationScope })
	scope: NotificationScope;

	@ApiPropertyOptional()
	appointmentId?: number;

	@ApiPropertyOptional()
	vaccineRegistryId?: number;

	@ApiPropertyOptional()
	userId?: number;

	@ApiPropertyOptional()
	arrivalDate?: Date;
}
