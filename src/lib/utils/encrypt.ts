import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const hash = async (str: string) => {
	const hash = await bcrypt.hash(str, 10);
	return hash;
};

export const genPassword = async () => {
	const psw = uuidv4().replace(/-/g, '').slice(0, 12);
	return await hash(psw);
};

export const compare = async (str: string, hash: string) => {
	return await bcrypt.compare(str, hash);
};

export const genUsername = (fullName: string) => {
	return fullName.split(' ').join('_').toLowerCase() + '@' + uuidv4();
};
