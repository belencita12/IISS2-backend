import { Environment } from '@/config/env.config';
import { EnvService } from '@/env/env.service';
import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
	private readonly transport: Transporter;

	constructor(private readonly env: EnvService) {
		this.transport = createTransport({
			host: this.env.get('EMAIL_HOST'),
			port: this.env.get('EMAIL_PORT'),
			secure: this.env.get('NODE_ENV') === Environment.Production,
			auth: {
				user: this.env.get('EMAIL_USER'),
				pass: this.env.get('EMAIL_PASS'),
			},
		});
	}

	async sendEmail({ to, subject, content, type }: SendEmailDto) {
		await this.transport.sendMail({
			from: this.env.get('EMAIL_USER'),
			to,
			subject,
			[type]: content,
		});
	}
}
