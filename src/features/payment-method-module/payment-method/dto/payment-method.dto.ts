import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsDateString } from 'class-validator';

export class PaymentMethodDto {
	constructor(paymentMethod: PaymentMethod) {
		this.id = paymentMethod.id;
		this.name = paymentMethod.name;
	}

	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiPropertyOptional()
	description?: string;

    @IsDateString()
	@ApiProperty()
	createdAt: Date;

    @IsDateString()
	@ApiPropertyOptional()
	deletedAt?: Date | null;
}
