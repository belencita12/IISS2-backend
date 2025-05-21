import { INestApplication } from '@nestjs/common';

export const disableHeaders = (app: INestApplication, headers: string[]) => {
	for (const h of headers) {
		app.getHttpAdapter().getInstance().disable(h);
	}
};
