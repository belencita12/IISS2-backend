import { applyDecorators } from '@nestjs/common';
import { IsString, Matches } from 'class-validator';
import { timeFormat } from '../utils/reg-exp';

export function IsTimeFormat(): PropertyDecorator {
	return applyDecorators(
		IsString(),
		Matches(timeFormat, { message: 'El formato esperado es HH:MM' }),
	);
}
