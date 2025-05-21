import { ApiProperty } from '@nestjs/swagger';
import { ReceiptPayMethodDto } from './receipt-pay-method.dto';

export class ReceiptDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	receiptNumber: string;

	@ApiProperty()
	invoiceId: number;

	@ApiProperty({ example: '2025-04-12' })
	issueDate: string;

	@ApiProperty()
	total: number;

	@ApiProperty({ type: [ReceiptPayMethodDto] })
	paymentMethods: ReceiptPayMethodDto[];
}
