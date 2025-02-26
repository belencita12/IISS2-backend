import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { setUpSwagger } from '@lib/utils/setup-swagger';
import { getCorsConfig } from './config/cors.config';
import { AllExceptionFilter } from './lib/filter/all-exception-filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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

	// Config Cors
	const corsConfig = getCorsConfig(ORIGIN);
	app.enableCors(corsConfig);

	await app.listen(PORT);
}
bootstrap();
