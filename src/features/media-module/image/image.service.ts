import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Image } from '@prisma/client';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '@features/prisma/prisma.service';
import { EnvService } from '@features/global-module/env/env.service';
import { ImgNames } from '@lib/constants/img.enum';
import { uploadConfig } from '@config/supabase.config';
import { resizeImg } from '@lib/utils/image';

@Injectable()
export class ImageService {
	private readonly logger = new Logger(ImageService.name);
	private readonly bucket: string;

	constructor(
		private readonly supabase: SupabaseService,
		private readonly db: PrismaService,
		private readonly env: EnvService,
	) {
		this.bucket = this.env.get('SUPABASE_BUCKET');
	}

	async create(file: Express.Multer.File) {
		const type = this.getFileType(file);
		const previewImg = await this.getPrevImg(file);
		const { originalUrl, previewUrl, path } = await this.save(
			[file.buffer, previewImg],
			type,
		);
		return await this.db.image.create({
			select: { originalUrl: true, previewUrl: true, id: true },
			data: {
				path,
				originalUrl,
				previewUrl,
			},
		});
	}

	async delete(id: number) {
		const img = await this.db.image.delete({
			where: { id },
		});
		const files = this.getRelativePaths(this.bucket, img);
		await this.handleImgDel(files);
	}

	async update(id: number, file: Express.Multer.File) {
		const type = this.getFileType(file);
		const previewImg = await this.getPrevImg(file);
		const img = await this.db.image.findUnique({ where: { id } });
		if (!img) throw new HttpException('Imagen no encontrada', 404);

		const files = this.getRelativePaths(this.bucket, img);

		await this.handleImgDel(files);
		const { originalUrl, previewUrl, path } = await this.save(
			[file.buffer, previewImg],
			type,
		);
		return await this.db.image.update({
			where: { id },
			select: { originalUrl: true, previewUrl: true, id: true },
			data: {
				path,
				originalUrl,
				previewUrl,
			},
		});
	}

	async upsert(initialImg: Image | null, newImg?: Express.Multer.File) {
		return newImg && initialImg !== null
			? await this.update(initialImg.id, newImg)
			: newImg && !initialImg
				? await this.create(newImg)
				: undefined;
	}

	private async handleImgDel(files: string[]) {
		const { error } = await this.supabase.storage
			.from(this.bucket)
			.remove(files);
		if (error) throw new HttpException('Error al eliminar una/s imagenes', 500);
	}

	private async save(files: Buffer[], type: string, currentPath?: string) {
		const baseUrl = `${this.env.get('SUPABASE_URL')}/storage/v1/object/public/${this.bucket}/`;

		if (files.length < 2)
			throw new HttpException('Debes subir al menos 2 imagenes', 400);

		const [original, preview] = files;
		const path = currentPath || this.genFolderName();

		const originalData = await this.handleImg(
			original,
			this.bucket,
			type,
			ImgNames.ORIGINAL,
			path,
		);
		const previewData = await this.handleImg(
			preview,
			this.bucket,
			type,
			ImgNames.PREVIEW,
			path,
		);

		return {
			originalUrl: `${baseUrl}${originalData.path}`,
			previewUrl: `${baseUrl}${previewData.path}`,
			path,
		};
	}

	private async handleImg(
		file: Buffer,
		bucket: string,
		type: string,
		name: string,
		path?: string,
	) {
		const { data, error } = await this.supabase.storage
			.from(bucket)
			.upload(`${path}/${name}.${type}`, file, {
				...uploadConfig,
				contentType: `image/${type}`,
			});
		if (error) {
			this.logger.error(error);
			throw new HttpException('Error al subir la imagen', 500);
		}
		return data;
	}

	private genFolderName() {
		const timestamp = Date.now();
		const random = Math.floor(Math.random() * 1000);
		return `${timestamp}_${random}`;
	}

	private getFileType(file: Express.Multer.File) {
		const { mimetype } = file;
		const type = mimetype.split('/')[1];
		return type;
	}

	private getRelativePaths(
		bucket: string,
		img: { originalUrl: string; previewUrl: string },
	): string[] {
		const pivot = `/${bucket}/`;
		return [img.originalUrl.split(pivot)[1], img.previewUrl.split(pivot)[1]];
	}

	private async getPrevImg(file: Express.Multer.File) {
		const previewSize = this.env.get('DEFAULT_PREVIEW_SIZE_PX');
		return await resizeImg(file, previewSize);
	}
}
