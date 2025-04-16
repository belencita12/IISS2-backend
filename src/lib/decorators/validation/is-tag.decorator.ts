import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsArray } from 'class-validator';

export const IsTag = () =>
	applyDecorators(
		IsArray(),
		Transform(({ value }: { value: string }) =>
			Array.isArray(value) ? value : value.split(',').map((tag) => tag.trim()),
		),
	);
