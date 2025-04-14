import { applyDecorators } from '@nestjs/common';
import { IsNumber, IsPositive } from 'class-validator';

export const IsPositiveNumber = (field?: string): PropertyDecorator => {
	return applyDecorators(
		IsNumber({}, { message: `${field} debe ser un numero` }),
		IsPositive({ message: `${field} debe ser una cantidad positiva` }),
	);
};
