export class TokenPayload {
	id: number;
	username: string;
	email: string;
	roles: string[];
}

export type ResetPassTokenPayload = Pick<TokenPayload, 'id'>;
