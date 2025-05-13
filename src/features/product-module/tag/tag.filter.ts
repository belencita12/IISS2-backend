import { Prisma } from '@prisma/client';
import { TagQueryDto } from './dto/tag-query.dto';

export class TagFilter {
	static getWhere(base: Prisma.TagWhereInput, query: TagQueryDto) {
		const where: Prisma.TagWhereInput = {
			...base,
			name: { contains: query.name, mode: 'insensitive' },
		};
		return where;
	}
}
