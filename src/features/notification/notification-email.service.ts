import { getNotificationTemplate } from '@features/global-module/email/templates/email-notification';
import { Role } from '@lib/constants/role.enum';
import { Injectable } from '@nestjs/common';
import { ICreateNotificationEmail } from './notification.types';
import { EmailService } from '@features/global-module/email/email.service';

@Injectable()
export class NotificationEmailService {
	constructor(private readonly email: EmailService) {}

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

		if (appointmentId) {
			actionUrl =
				(isEmployee ? '/dashboard' : '/user-profile') +
				`/appointments/${appointmentId}`;
		}

		if (vaccineRegistryId) {
			actionUrl = isEmployee
				? `/dashboard/clients/${clientId}/pets/${petId}`
				: `/user-profile/pet/${petId}`;
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
