import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';

export const IsInvoiceStamped = () =>
	applyDecorators(
		Matches(/^\d{8}$/, {
			message: 'El formato del timbrado no es correcto, debe ser 12345678',
		}),
	);
