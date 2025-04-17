import { invoiceNumber } from '@lib/utils/reg-exp';
import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';

export const IsInvoiceNumber = () =>
	applyDecorators(
		Matches(invoiceNumber, {
			message:
				'El formato del num. de factura no es valido, debe ser 123-123-1234567',
		}),
	);
