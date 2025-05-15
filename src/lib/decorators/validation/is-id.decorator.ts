import { applyDecorators } from '@nestjs/common';
import { IsInt, IsPositive, ValidationOptions } from 'class-validator';

export function IsId(
	message?: string,
	options?: ValidationOptions,
): PropertyDecorator {
	return applyDecorators(
		IsInt({ message, ...options }),
		IsPositive({ message, ...options }),
	);
}
