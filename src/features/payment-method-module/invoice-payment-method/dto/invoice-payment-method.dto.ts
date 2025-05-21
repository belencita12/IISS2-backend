import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoicePaymentMethod, PaymentMethod } from '@prisma/client';

export interface invoicePaymentMethodEntity extends InvoicePaymentMethod {
	method: PaymentMethod;
}

export class InvoicePaymentMethodDto {
	constructor(entity: invoicePaymentMethodEntity) {
		this.id = entity.id;
		this.method = entity.method.name;
		this.invoiceId = entity.invoiceId;
		this.amount = entity.amount;
		this.createdAt = entity.createdAt;
		this.deletedAt = entity.deletedAt;
	}

	@ApiProperty()
	id: number;

	@ApiProperty()
	method: string;

	@ApiProperty()
	invoiceId: number;

	@ApiProperty()
	amount: number;

	@ApiProperty()
	createdAt: Date;

	@ApiPropertyOptional()
	deletedAt?: Date | null;
}
