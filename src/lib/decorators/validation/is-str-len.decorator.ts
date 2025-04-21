import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const IsStrLen = (min: number, max?: number) =>
	applyDecorators(
		IsString({ message: 'Debe proveerse una cadena de texto' }),
		MinLength(min, { message: `La longitud minima es de ${min} caracteres` }),
		Matches(/\S/, {
			message:
				'La cadena no puede estar vacía o solo contener espacios en blanco',
		}),
		...(max
			? [
					MaxLength(max, {
						message: `La longitud maxima es de ${max} caracteres`,
					}),
				]
			: []),
	);
