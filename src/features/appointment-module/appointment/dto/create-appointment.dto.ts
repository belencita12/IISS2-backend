import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { IsTimeFormat } from '@lib/decorators/validation/is-time-format';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
	@ApiProperty()
	@IsId()
	petId: number;

	@ApiProperty({ example: '2025-04-12' })
	@IsDbDate()
	designatedDate: string;

	@ApiProperty({ example: '09:05' })
	@IsTimeFormat()
	designatedTime: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	details?: string;

	@ApiProperty()
	@IsId()
	serviceId: number;

	@ApiProperty({ type: [Number] })
	@ArrayMinSize(1, { message: 'Debe haber al menos un empleado' })
	@IsId('El identificador del empleado', { each: true })
	employeesId: number[];
}
