import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { Response } from 'express';

export interface IReport<Q> {
	getReport(query: Q, user: TokenPayload, response: Response): Promise<void>;
}
