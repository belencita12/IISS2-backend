import { uploadConfig } from '@/config/supabase.config';
import { EnvService } from '@/env/env.service';
import { ImgNames } from '@/lib/constants/img.enum';
import { resizeImg } from '@/lib/utils/image';
import { PrismaService } from '@/prisma/prisma.service';
import { SupabaseService } from '@/supabase/supabase.service';
import { HttpException, Injectable, Logger } from '@nestjs/common';

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
		const previewSize = this.env.get('DEFAULT_PREVIEW_SIZE_PX');
		const type = this.getFileType(file);
		const previewImg = await resizeImg(file, previewSize);
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
			select: { path: true },
		});
		await this.supabase.storage.from(this.bucket).remove([img.path]);
	}

	async update(id: number, file: Express.Multer.File) {
		const previewSize = this.env.get('DEFAULT_PREVIEW_SIZE_PX');
		const type = this.getFileType(file);
		const previewImg = await resizeImg(file, previewSize);
		const img = await this.db.image.findUnique({
			where: { id },
			select: { path: true },
		});
		if (!img) throw new HttpException('Imagen no encontrada', 404);
		const { originalUrl, previewUrl, path } = await this.save(
			[file.buffer, previewImg],
			type,
			img.path,
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

	private async save(files: Buffer[], type: string, currentPath?: string) {
		const baseUrl = `${this.env.get('SUPABASE_URL')}/storage/v1/object/public/${this.bucket}/`;

		if (files.length < 2)
			throw new HttpException('Debes subir al menos 2 imagenes', 400);

		const [original, preview] = files;
		const path = currentPath || this.genFolderName();

		const originalData = await this.uploadImg(
			original,
			this.bucket,
			type,
			ImgNames.ORIGINAL,
			path,
		);
		const previewData = await this.uploadImg(
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

	private async uploadImg(
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
				contentType: type,
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
}
