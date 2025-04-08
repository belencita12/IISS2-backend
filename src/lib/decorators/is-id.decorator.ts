import { applyDecorators } from '@nestjs/common';
import { IsInt, IsPositive, Min } from 'class-validator';

export function IsId(): PropertyDecorator {
	return applyDecorators(IsInt(), IsPositive(), Min(1));
}
