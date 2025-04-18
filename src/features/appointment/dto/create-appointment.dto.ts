import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
	@ApiProperty()
	@IsId()
	petId: number;

	@Type(() => Date)
	@ApiProperty()
	@IsDate()
	designatedDate: Date;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	details?: string;

	@ApiProperty()
	@IsId()
	serviceId: number;

	@ApiProperty({ type: [Number] })
	@IsId('El identificador del empleado', { each: true })
	employeesId: number[];
}
