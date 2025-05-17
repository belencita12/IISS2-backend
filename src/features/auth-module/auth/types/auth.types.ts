export class TokenPayload {
	id: number;
	username: string;
	fullName: string;
	email: string;
	ruc: string;
	roles: string[];
	employeeId?: number;
	clientId?: number;
}

export type ResetPassTokenPayload = Pick<TokenPayload, 'id'>;
