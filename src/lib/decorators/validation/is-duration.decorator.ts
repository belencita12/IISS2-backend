import { applyDecorators } from '@nestjs/common';
import { IsInt, IsPositive } from 'class-validator';
import { IsMultipleOf } from './is-multiple-of.decorator';

export const IsDuration = () =>
	applyDecorators(IsInt(), IsPositive(), IsMultipleOf(5));
