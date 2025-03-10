import { DelImgGuard } from '@/lib/guard/del-img.guard';
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ImageService } from './image.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('image')
@ApiTags('Image')
@ApiBearerAuth('access-token')
export class ImageController {
	constructor(private readonly imgService: ImageService) {}

	@UseGuards(DelImgGuard)
	@Delete(':id')
	async deleteImage(@Param('id') imageId: string) {
		await this.imgService.delete(+imageId);
	}
}
