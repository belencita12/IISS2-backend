import * as Sharp from 'sharp';

export const resizeImg = async (
	img: Express.Multer.File,
	width: number,
	height?: number,
) => {
	return await Sharp(img.buffer)
		.resize({
			width,
			height,
		})
		.toBuffer();
};
