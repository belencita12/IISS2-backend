import { getNotificationTemplate } from '@features/global-module/email/templates/email-notification';
import { Role } from '@lib/constants/role.enum';
import { Injectable } from '@nestjs/common';
import { ICreateNotificationEmail } from './notification.types';
import { EmailService } from '@features/global-module/email/email.service';
import { EnvService } from '@features/global-module/env/env.service';

@Injectable()
export class NotificationEmailService {
	constructor(
		private readonly email: EmailService,
		private readonly env: EnvService,
	) {}

	async sendEmail(data: ICreateNotificationEmail) {
		const {
			date,
			petId,
			clientId,
			userEmail,
			userRoles,
			appointmentId,
			vaccineRegistryId,
			...rest
		} = data;
		let actionUrl: string | undefined = undefined;
		const isEmployee = userRoles.some((r) => Role.Employee.match(r.name));
		const feHost = this.env.get('FE_HOST');

		if (appointmentId) {
			actionUrl =
				feHost +
				(isEmployee ? '/dashboard' : '/user-profile') +
				`/appointments/${appointmentId}`;
		}

		if (vaccineRegistryId) {
			actionUrl =
				feHost +
				(isEmployee
					? `/dashboard/clients/${clientId}/pets/${petId}`
					: `/user-profile/pet/${petId}`);
		}

		await this.email.sendEmail({
			to: userEmail,
			subject: rest.title,
			content: getNotificationTemplate({
				...rest,
				action_url: actionUrl,
				appointmentDate: date,
			}),
			type: 'html',
		});
	}
}
