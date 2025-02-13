import * as bcrypt from 'bcrypt';
export const hash = async (str: string) => {
	const hash = await bcrypt.hash(str, 10);
	return hash;
};

export const compare = async (str: string, hash: string) => {
	return await bcrypt.compare(str, hash);
};
