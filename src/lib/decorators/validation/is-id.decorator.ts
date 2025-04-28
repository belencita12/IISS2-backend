import { applyDecorators } from '@nestjs/common';
import { IsInt, IsPositive, ValidationOptions } from 'class-validator';

export function IsId(
	field: string = '',
	options?: ValidationOptions,
): PropertyDecorator {
	return applyDecorators(
		IsInt({ message: `${field} debe ser un numero valido`, ...options }),
		IsPositive({ message: `${field} debe ser positivo`, ...options }),
	);
}
