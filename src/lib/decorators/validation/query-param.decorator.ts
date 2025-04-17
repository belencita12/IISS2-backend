import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export const QueryParam = (options?: ApiPropertyOptions) =>
	applyDecorators(IsOptional(), ApiPropertyOptional(options));
