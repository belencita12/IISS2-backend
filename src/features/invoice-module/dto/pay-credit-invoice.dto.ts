import { IsDbDate } from '@lib/decorators/validation/is-db-date.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNumber,
	IsPositive,
	IsString,
	ValidateNested,
} from 'class-validator';
import { InvoicePaymentMethodDetailDto } from './invoice-payment-method-detail.dto';
import { NoDuplicatesBy } from '@lib/decorators/validation/no-duplicated-by.decorator';
import { Type } from 'class-transformer';

export class PayCreditInvoiceDto {
	@IsNumber()
	@IsPositive()
	@ApiProperty()
	amount: number;

	@IsDbDate()
	@IsString()
	@ApiProperty()
	paymentDate: string;

	@Type(() => InvoicePaymentMethodDetailDto)
	@ValidateNested({ each: true })
	@ApiPropertyOptional({ type: [InvoicePaymentMethodDetailDto] })
	@NoDuplicatesBy<InvoicePaymentMethodDetailDto>('methodId', {
		message: 'No se permiten metodos duplicados',
	})
	paymentMethods: InvoicePaymentMethodDetailDto[];
}
