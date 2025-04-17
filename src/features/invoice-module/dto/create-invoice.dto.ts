import { ApiProperty, OmitType } from '@nestjs/swagger';
import { InvoiceDto } from './invoice.dto';
import { CreateInvoiceDetailDto } from './create-invoice-detail.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CreateInvoiceDto extends OmitType(InvoiceDto, [
	'id',
	'total',
	'totalVat',
	'ruc',
	'clientName',
]) {
	@ApiProperty({ type: [CreateInvoiceDetailDto] })
	@ValidateNested({ each: true })
	@Type(() => CreateInvoiceDetailDto)
	details: CreateInvoiceDetailDto[];

	@ApiProperty()
	@IsId('El identificador del cliente')
	clientId: number;

	@ApiProperty()
	@IsId('El identificador del deposito')
	stockId: number;
}
