import { applyDecorators } from '@nestjs/common';
import { IsInt, IsPositive } from 'class-validator';

export function IsId(field: string = ''): PropertyDecorator {
	return applyDecorators(
		IsInt({ message: `${field} debe ser un numero valido` }),
		IsPositive({ message: `${field} debe ser positivo` }),
	);
}
