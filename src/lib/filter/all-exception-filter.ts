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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	private readonly logger = new Logger(AllExceptionFilter.name);

	catch(ex: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const path: string = httpAdapter.getRequestUrl(ctx.getRequest());
		let httpStatus =
			ex instanceof HttpException
				? ex.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		let message: string =
			ex instanceof HttpException ? ex.message : 'Internal Server Error';

		this.logger.error(ex);

		if (ex instanceof PrismaClientKnownRequestError) {
			if (ex.code === 'P2002') {
				if (path.startsWith('/auth') || path.startsWith('/user')) {
					message =
						'Las credenciales ya están en uso. Intente con datos diferentes';
					httpStatus = HttpStatus.UNAUTHORIZED;
				} else {
					message =
						'Uno o más campos ya están en uso. Intente con datos diferentes';
					httpStatus = HttpStatus.BAD_REQUEST;
				}
			}
		}

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
			path: path,
		};

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
