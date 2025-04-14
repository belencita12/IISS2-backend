import { Delete, Param, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { DelImgGuard } from '@lib/guard/del-img.guard';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { AppController } from '@lib/decorators/router/app-controller.decorator';

@AppController({ name: 'media', tag: 'Media' })
export class MediaController {
	constructor(private readonly media: MediaService) {}

	@UseGuards(DelImgGuard)
	@Delete(':id')
	async deleteImage(@Param('id', IdValidationPipe) id: number) {
		await this.media.delete(id);
	}
}
