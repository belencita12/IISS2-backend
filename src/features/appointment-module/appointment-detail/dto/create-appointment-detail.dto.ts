import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateAppointmentDetailDto {
	@IsId('El identificador del servicio no es valido')
	@ApiProperty()
	serviceId: number;

	@IsId('Alguno de los identificadores no son validos', { each: true })
	@ApiProperty({ type: [Number] })
	@IsOptional()
	employeeIds: number[];
}
