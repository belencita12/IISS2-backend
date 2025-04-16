import { applyDecorators } from '@nestjs/common';
import { IsInt, IsPositive, Max } from 'class-validator';
import { IsMultipleOf } from './is-multiple-of.decorator';

export const IsDuration = () =>
	applyDecorators(
		IsInt({ message: 'La duracion debe ser un entero' }),
		IsPositive({ message: 'La duracion debe ser mayor a 0' }),
		Max(720, { message: 'La duracion estimada no debe superar 12 hrs' }),
		IsMultipleOf(5, { message: 'La duracion debe ser multiplo de 5' }),
	);
