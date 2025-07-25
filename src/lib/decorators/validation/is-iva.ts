import { applyDecorators } from '@nestjs/common';
import { IsInt, Max, Min } from 'class-validator';

export const IsIVA = () =>
	applyDecorators(
		IsInt({ message: 'El valor de Iva debe ser un entero' }),
		Min(0, { message: 'El valor minimo de Iva es de 0' }),
		Max(100, { message: 'El valor maximo de Iva es de 100' }),
	);
