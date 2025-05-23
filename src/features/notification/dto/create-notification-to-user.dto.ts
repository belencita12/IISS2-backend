import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateNotificationToUserDto {
	@ApiProperty()
	@IsString()
	title: string;

	@ApiProperty()
	@IsString()
	description: string;

	@IsEnum(NotificationType)
	@ApiProperty({ enum: NotificationType })
	type: NotificationType;

	@IsOptional()
	@IsId('El identificador de la cita no es valido')
	@ApiPropertyOptional()
	appointmentId?: number;

	@IsOptional()
	@IsId('El identificador del registro de la vacuna no es valido')
	@ApiPropertyOptional()
	vaccineRegistryId?: number;
}
