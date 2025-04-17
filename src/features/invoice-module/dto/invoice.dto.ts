import { IsPositiveNumber } from '@lib/decorators/validation/is-money.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Client, Invoice, InvoiceType, User } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsDateString,
	IsEnum,
	IsNumber,
	IsPositive,
	IsString,
} from 'class-validator';

export interface InvoiceEnity extends Invoice {
	client: Client & { user: User };
}

export class InvoiceDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	total: number;

	@ApiProperty()
	@Type(() => Number)
	@IsPositiveNumber('Lo pagado')
	totalPayed: number;

	@ApiProperty()
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	totalVat: number;

	@ApiProperty()
	@IsString()
	invoiceNumber: string;

	@ApiProperty()
	@IsString()
	stamped: string;

	@ApiProperty()
	ruc: string;

	@ApiProperty()
	clientName: string;

	@ApiProperty({ enum: InvoiceType })
	@IsEnum(InvoiceType)
	type: InvoiceType;

	@ApiProperty()
	@IsDateString()
	issueDate: Date;

	constructor(data: InvoiceEnity) {
		this.id = data.id;
		this.ruc = data.client.user.ruc;
		this.clientName = data.client.user.fullName;
		this.invoiceNumber = data.invoiceNumber;
		this.stamped = data.stamped;
		this.issueDate = data.issueDate;
		this.total = data.total.toNumber();
		this.totalPayed = data.totalPayed.toNumber();
		this.totalVat = data.totalVat.toNumber();
		this.type = data.type;
	}
}
