import { rucFormat } from '@lib/utils/reg-exp';
import { applyDecorators } from '@nestjs/common';
import { IsString, Matches } from 'class-validator';

export const IsRuc = (): PropertyDecorator => {
	return applyDecorators(
		IsString(),
		Matches(rucFormat, { message: 'El ruc no es valido' }),
	);
};
