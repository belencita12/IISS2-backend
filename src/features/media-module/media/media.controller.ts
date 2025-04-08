import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { DelImgGuard } from '@lib/guard/del-img.guard';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('media')
@ApiTags('Media')
@ApiBearerAuth('access-token')
export class MediaController {
	constructor(private readonly media: MediaService) {}

	@UseGuards(DelImgGuard)
	@Delete(':id')
	async deleteImage(@Param('id', IdValidationPipe) id: number) {
		await this.media.delete(id);
	}
}
