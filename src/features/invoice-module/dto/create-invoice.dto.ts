import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateInvoiceDetailDto } from './create-invoice-detail.dto';
import { IsId } from '@lib/decorators/validation/is-id.decorator';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { InvoiceType } from '@prisma/client';
import { IsInvoiceStamped } from '@lib/decorators/validation/is-invoice-stamped.decorator';
import { IsInvoiceNumber } from '@lib/decorators/validation/is-invoice-number.decorator';
import { NoDuplicatesBy } from '@lib/decorators/validation/no-duplicated-by.decorator';

export class CreateInvoiceDto {
	@ApiProperty()
	@IsId('El identificador del cliente')
	clientId: number;

	@ApiProperty()
	@IsId('El identificador del deposito')
	stockId: number;

	@ApiProperty()
	@IsInvoiceNumber()
	invoiceNumber: string;

	@ApiProperty()
	@IsInvoiceStamped()
	stamped: string;

	@ApiProperty({ example: '2025-12-11' })
	@IsDbDate()
	issueDate: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsPositiveNumber('Lo pagado')
	totalPayed?: number;

	@ApiProperty({ enum: InvoiceType })
	@IsEnum(InvoiceType)
	type: InvoiceType;

	@ApiProperty({ type: [CreateInvoiceDetailDto] })
	@ValidateNested({ each: true })
	@Type(() => CreateInvoiceDetailDto)
	@NoDuplicatesBy<CreateInvoiceDetailDto>('productId', {
		message: 'No se permiten productos duplicados',
	})
	details: CreateInvoiceDetailDto[];
}
