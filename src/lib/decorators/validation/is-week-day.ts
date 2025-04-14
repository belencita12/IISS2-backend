import { applyDecorators } from '@nestjs/common';
import { IsInt, Max, Min } from 'class-validator';

export function IsWeekDay(): PropertyDecorator {
	return applyDecorators(
		IsInt(),
		Min(0, { message: 'El dia de la semana debe estar entre 0 y 6' }),
		Max(6, { message: 'El dia de la semana debe estar entre 0 y 6' }),
	);
}
