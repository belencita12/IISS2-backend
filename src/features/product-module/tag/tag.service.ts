import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagDto } from './dto/tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { Prisma, ProductTag, Tag } from '@prisma/client';

@Injectable()
export class TagService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateTagDto) {
		const tag = await this.db.tag.create({ data: dto });
		return new TagDto(tag);
	}

	async findOne(id: number) {
		const tag = await this.db.tag.findUnique({ where: { id } });
		if (!tag) throw new NotFoundException('Tag no encontrada');
		return new TagDto(tag);
	}

	async findAll(query: TagQueryDto) {
		return await this.filterTags(query);
	}

	async update(id: number, dto: UpdateTagDto) {
		const exists = await this.db.tag.isExists({ id });
		if (!exists) throw new NotFoundException('Tag no encontrada');
		const updated = await this.db.tag.update({ where: { id }, data: dto });
		return new TagDto(updated);
	}

	async remove(id: number) {
		const exists = await this.db.tag.isExists({ id });
		if (!exists) throw new NotFoundException('Tag no encontrado');
		return await this.db.tag.softDelete({ id });
	}

	connectTags(tags?: string[]) {
		return tags
			? {
					create: tags.map((tName) => ({
						tag: {
							connect: {
								name: tName,
							},
						},
					})),
				}
			: undefined;
	}

	handleUpdateTags(prevTags: (ProductTag & { tag: Tag })[], dtoTags: string[]) {
		const newTags = dtoTags.filter(
			(newTag) => !prevTags.some((tag) => tag.tag.name === newTag),
		);

		const tagToDel = prevTags
			.filter((tag) => !dtoTags.includes(tag.tag.name))
			.map((t) => t.tagId);

		return {
			create: newTags.map((t) => ({
				tag: { connect: { name: t } },
			})),
			deleteMany: { tagId: { in: tagToDel } },
		};
	}

	private async filterTags(query: TagQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where: Prisma.TagWhereInput = {
			...baseWhere,
			name: { contains: query.name, mode: 'insensitive' },
		};
		const [data, total] = await Promise.all([
			this.db.tag.findMany({
				...this.db.paginate(query),
				where,
			}),
			this.db.tag.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data: data.map((t) => new TagDto(t)),
		});
	}
}
