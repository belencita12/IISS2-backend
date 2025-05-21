import { Tag } from '@prisma/client';
import { TagDto } from './dto/tag.dto';

export class TagMapper {
	static toDto(data: Tag): TagDto {
		return {
			id: data.id,
			name: data.name,
		};
	}
}
