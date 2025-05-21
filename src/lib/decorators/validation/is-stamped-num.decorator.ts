import { applyDecorators } from '@nestjs/common';
import { IsInt, Min, Max } from 'class-validator';

export const IsStampedNum = () =>
	applyDecorators(
		IsInt({ message: 'Debe ser un numero entero' }),
		Min(0, { message: 'Debe ser un numero positivo' }),
		Max(9999999, { message: 'No se puede exceder el num maximo de facturas' }),
	);
