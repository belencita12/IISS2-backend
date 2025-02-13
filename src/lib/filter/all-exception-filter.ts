import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	BadRequestException,
	Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	private readonly logger = new Logger(AllExceptionFilter.name);

	catch(ex: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const httpStatus =
			ex instanceof HttpException
				? ex.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		let message: string = 'Internal Server Error';

		this.logger.error(ex);

		if (ex instanceof BadRequestException) {
			const response = ex.getResponse();
			message = Array.isArray(response['message'])
				? response['message'][0]
				: response['message'];
		}

		const responseBody = {
			statusCode: httpStatus,
			timestamp: new Date().toISOString(),
			message,
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
		};

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
