import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './features/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { setUpSwagger } from '@lib/utils/setup-swagger';
import { getCorsConfig } from './config/cors.config';
import { AllExceptionFilter } from './lib/filter/all-exception-filter';
import { EnvService } from './features/global-module/env/env.service';
import { configLoggerLevel } from '@config/logger-level.config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	// Config validation
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	// Config class serializer
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

	// Config exception global handler
	const httpAdapter = app.get(HttpAdapterHost);
	app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

	// Config swagger
	setUpSwagger({
		app,
		title: 'Nico Pets',
		description: 'Swagger Api for Nico Pets',
		path: 'api',
		version: '1.0',
	});

	// Get env values
	const env = app.get(EnvService);
	const PORT = env.get('PORT');
	const ORIGIN = env.get('CORS_ORIGIN');

	// Config Logger by enviroment
	configLoggerLevel(env, app);

	// Config Cors
	const corsConfig = getCorsConfig(ORIGIN);
	app.enableCors(corsConfig);

	await app.listen(PORT);
}
bootstrap();
