import { InvoicePaymentMethodDto } from '@features/payment-method-module/invoice-payment-method/dto/invoice-payment-method.dto';
import { PickType } from '@nestjs/swagger';

export class ReceiptPayMethodDto extends PickType(InvoicePaymentMethodDto, [
	'amount',
	'method',
]) {}
