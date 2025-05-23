import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsIn, IsString } from 'class-validator';

export class CreateNotificationBroadcastDto {
	@ApiProperty()
	@IsString()
	title: string;

	@ApiProperty()
	@IsString()
	description: string;

	@IsIn([NotificationType.ALERT, NotificationType.INFO])
	@ApiProperty({ enum: [NotificationType.ALERT, NotificationType.INFO] })
	type: NotificationType;
}
