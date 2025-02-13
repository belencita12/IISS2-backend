import { plainToInstance, Transform } from 'class-transformer';
import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
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
	@Transform(({ value }) => value.split(','))
	@IsOptional()
	CORS_ORIGIN: string[] = ['*'];

	@IsEnum(PrismaLogLevels, { each: true })
	@Transform(({ value }) => value.split(','))
	@IsOptional()
	PRISMA_LOG_LEVEL: PrismaLogLevels[] = [];
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
