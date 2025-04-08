import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { createClient } from '@supabase/supabase-js';

type PrismaTransactionClient = Omit<
	PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
	'$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

export const BUCKET = process.env.SUPABASE_BUCKET || '';
export const SUPABASE_LINK = process.env.SUPABASE_URL || '';
export const SUPABASE_ANON = process.env.SUPABASE_KEY || '';
const BASE_IMG_LINK = `${SUPABASE_LINK}/storage/v1/object/public/${BUCKET}/`;

const supabase = createClient(SUPABASE_LINK, SUPABASE_ANON);

export const dogImgs = [
	'https://images.squarespace-cdn.com/content/v1/54822a56e4b0b30bd821480c/45ed8ecf-0bb2-4e34-8fcf-624db47c43c8/Golden+Retrievers+dans+pet+care.jpeg',
	'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Labrador_on_Quantock_%282175262184%29.jpg/1200px-Labrador_on_Quantock_%282175262184%29.jpg',
	'https://somosmaka.com/cdn/shop/articles/perro_mestizo.jpg?v=1697855331',
];

export const productsImgs = [
	'https://www.4pets.com.py/cdn/shop/files/Nexgard10_1-25.jpg?v=1739708269',
	'https://holliday-scott.com/images/w441_h441_at__20190315144342tf_suspgatos.png',
	'https://m.media-amazon.com/images/I/61UKBlxLlwL.jpg',
	'https://www.agrofield.com.py/88751-large_default/shampoo-pulgafin-x-1-litro-universal.jpg',
];

export const uploadImg = async (url: string, tx: PrismaTransactionClient) => {
	const names = ['original', 'preview'];
	const response = await fetch(url);
	const blob = await response.arrayBuffer();
	const path = Date.now().toString();
	const images: string[] = [];
	for (const name of names) {
		const { data, error } = await supabase.storage
			.from(BUCKET)
			.upload(`${path}/${name}.jpg`, blob, {
				contentType: `image/jpg`,
				upsert: true,
			});
		if (error) throw new Error(error.message);
		images.push(`${BASE_IMG_LINK}${data.path}`);
	}
	return await tx.image.create({
		data: { originalUrl: images[0], previewUrl: images[1], path },
	});
};
