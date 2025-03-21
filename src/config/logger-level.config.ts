import { EnvService } from '@features/global-module/env/env.service';
import { Environment } from './env.config';
import { INestApplication, LogLevel } from '@nestjs/common';

export const configLoggerLevel = (env: EnvService, app: INestApplication) => {
	const logLevel: LogLevel[] =
		env.get('NODE_ENV') === Environment.Development
			? ['debug', 'log', 'warn', 'error']
			: ['error', 'warn'];
	app.useLogger(logLevel);
};
