import { applyDecorators } from '@nestjs/common';
import { IsNumber, Max, Min } from 'class-validator';

export const IsIVA = () =>
	applyDecorators(
		IsNumber({ maxDecimalPlaces: 2 }),
		Min(0.01, { message: 'El valor minimo de Iva es de 0.01' }),
		Max(1, { message: 'El valor maximo de Iva es de 1' }),
	);
