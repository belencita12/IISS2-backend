import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export type SwaggerConfig = {
	app: INestApplication;
	isProduction: boolean;
	tag?: string[];
	title?: string;
	description?: string;
	version?: string;
	path?: string;
};

export const setUpSwagger = ({
	app,
	isProduction,
	tag,
	title,
	description,
	version,
	path,
}: SwaggerConfig) => {
	if (isProduction) return;
	const config = new DocumentBuilder()
		.setTitle(title || 'Example Title')
		.setDescription(description || 'Swagger Api example description')
		.setVersion(version || '1.0')
		.addBearerAuth({
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
		});
	if (tag) tag.forEach((tag) => config.addTag(tag));
	const doc = config.build();
	const documentFactory = () => SwaggerModule.createDocument(app, doc);
	SwaggerModule.setup(path || 'api', app, documentFactory);
};
