import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const ApiPdfResponse = () =>
	applyDecorators(
		ApiResponse({
			content: {
				'application/pdf': { schema: { type: 'string', format: 'binary' } },
			},
		}),
	);
