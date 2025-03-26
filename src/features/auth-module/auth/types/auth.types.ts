export class TokenPayload {
	id: number;
	username: string;
	email: string;
	roles: string[];
	employeeId?: number;
	clientId?: number;
}

export type ResetPassTokenPayload = Pick<TokenPayload, 'id'>;
