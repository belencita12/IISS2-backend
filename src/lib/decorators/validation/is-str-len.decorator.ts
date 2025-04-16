import { applyDecorators } from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';

export const IsStrLen = (min: number, max?: number) =>
	applyDecorators(
		IsString({ message: 'Debe proveerse una cadena de texto' }),
		MinLength(min, { message: `La longitud minima es de ${min} caracteres` }),
		...(max
			? [
					MaxLength(max, {
						message: `La longitud maxima es de ${max} caracteres`,
					}),
				]
			: []),
	);
