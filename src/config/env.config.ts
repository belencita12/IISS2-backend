import { plainToInstance, Transform } from 'class-transformer';
import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsTimeZone,
	Max,
	Min,
	validateSync,
} from 'class-validator';

export enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
	Provision = 'provision',
}

export enum PrismaLogLevels {
	Query = 'query',
	Info = 'info',
	Warn = 'warn',
	Error = 'error',
}

class EnvironmentVariables {
	@IsEnum(Environment)
	@IsOptional()
	NODE_ENV: Environment = Environment.Development;

	@IsNumber()
	@Min(0)
	@Max(65535)
	@IsOptional()
	PORT: number = 8000;

	@IsNumber()
	@Min(0)
	@IsOptional()
	JWT_EXP: number = 604800000;

	@IsString()
	@IsOptional()
	JWT_SECRET: string = 'secret';

	@IsString({ each: true })
	@Transform(({ value }) => (value ? value.split(',') : '*'))
	@IsOptional()
	CORS_ORIGIN: string[] | string = '*';

	@IsNumber()
	@IsOptional()
	DEFAULT_PAGE_SIZE: number = 10;

	@IsString()
	EMAIL_HOST: string;

	@IsNumber()
	EMAIL_PORT: number;

	@IsString()
	EMAIL_USER: string;

	@IsString()
	EMAIL_PASS: string;

	@IsString()
	@IsOptional()
	JWT_RESET_PASS_SECRET: string = 'reset_password_secret';

	@IsNumber()
	@Min(0)
	@IsOptional()
	JWT_RESET_PASS_EXP: number = 1800000;

	@IsString()
	FE_HOST: string;

	@IsString()
	SUPABASE_URL: string;

	@IsString()
	SUPABASE_KEY: string;

	@IsNumber()
	@IsOptional()
	DEFAULT_PREVIEW_SIZE_PX: number = 64;

	@IsString()
	@IsOptional()
	SUPABASE_BUCKET: string = 'images';

	@IsOptional()
	@IsString()
	CLIENT_EXPRESS_NAME: string = 'CLIENTE_EXPRESS';

	@IsOptional()
	@IsString()
	CLIENT_EXPRESS_RUC: string = 'XXX';

	@IsOptional()
	@IsOptional()
	@IsString()
	@IsTimeZone()
	SYS_TIME_ZONE: string = 'America/Asuncion';
}

export type EnvType = InstanceType<typeof EnvironmentVariables>;

export const validate = (config: Record<string, unknown>) => {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});
	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}
	return validatedConfig;
};
