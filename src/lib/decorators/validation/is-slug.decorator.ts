import { serviceTypeSlugFormat } from '@lib/utils/reg-exp';
import { applyDecorators } from '@nestjs/common';
import { IsString, Matches } from 'class-validator';

export const IsSlug = () =>
	applyDecorators(
		IsString({ message: 'Debe proveerse una cadena de texto' }),
		Matches(serviceTypeSlugFormat, {
			message: 'Utilice un formato valido. Ej: reunion-15-min',
		}),
	);
