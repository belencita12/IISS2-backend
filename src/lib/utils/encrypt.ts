import * as bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';

export const hash = async (str: string) => {
	const hash = await bcrypt.hash(str, 10);
	return hash;
};

export const compare = async (str: string, hash: string) => {
	return await bcrypt.compare(str, hash);
};

const alphabet =
	process.env.NANOID_ALPHABET ||
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
const length = Number(process.env.NANOID_LENGTH) || 16;

export const genUsername = (fullName: string) => {
	const nanoid = customAlphabet(alphabet, length);
	return fullName.split(' ').join('_').toLowerCase() + '@' + nanoid();
};
