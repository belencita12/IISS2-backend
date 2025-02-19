export class TokenPayload {
	id: number;
	username: string;
	email: string;
}

export type ResetPassTokenPayload = Pick<TokenPayload, 'id'>;
