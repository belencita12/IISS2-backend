export class SendEmailDto {
	to: string;
	subject: string;
	content: string;
	type: 'html' | 'text';
}
