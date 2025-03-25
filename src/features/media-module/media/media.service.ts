import { Injectable } from '@nestjs/common';
import { ImageService } from '../image/image.service';

@Injectable()
export class MediaService {
	constructor(private readonly img: ImageService) {}

	async delete(id: number) {
		await this.img.delete(id);
	}
}
