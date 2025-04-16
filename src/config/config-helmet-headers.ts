import { NestExpressApplication } from '@nestjs/platform-express';
import helmet, { HelmetOptions } from 'helmet';

export const configHelmetHeaders = (
	app: NestExpressApplication,
	options?: HelmetOptions,
) => {
	app.set('trust proxy', 1);
	app.use(helmet(options));
};
