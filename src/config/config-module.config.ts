import { ConfigModuleOptions } from '@nestjs/config';
import { validate } from './env.config';

export const configModuleOptions: ConfigModuleOptions = {
	validate: validate,
	isGlobal: true,
};
