import { applyDecorators, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export type AppControllerConfig = {
	name: string;
	tag?: string;
	auth?: boolean;
};

export const AppController = ({
	name,
	tag,
	auth = true,
}: AppControllerConfig): ClassDecorator =>
	applyDecorators(
		Controller(name),
		ApiTags(tag || name),
		...(auth ? [ApiBearerAuth()] : []),
	);
