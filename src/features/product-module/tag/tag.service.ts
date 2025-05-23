import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { ProductTag, Tag } from '@prisma/client';
import { TagFilter } from './tag.filter';
import { TagMapper } from './tag.mapper';

@Injectable()
export class TagService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateTagDto) {
		const tag = await this.db.tag.create({ data: dto });
		return TagMapper.toDto(tag);
	}

	async findOne(id: number) {
		const tag = await this.db.tag.findUnique({ where: { id } });
		if (!tag) throw new NotFoundException('Tag no encontrada');
		return TagMapper.toDto(tag);
	}

	async findAll(query: TagQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where = TagFilter.getWhere(baseWhere, query);
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
			data: data.map((t) => TagMapper.toDto(t)),
		});
	}

	async update(id: number, dto: UpdateTagDto) {
		const exists = await this.db.tag.isExists({ id });
		if (!exists) throw new NotFoundException('Tag no encontrada');
		const updated = await this.db.tag.update({ where: { id }, data: dto });
		return TagMapper.toDto(updated);
	}

	async remove(id: number) {
		const exists = await this.db.tag.isExists({ id });
		if (!exists) throw new NotFoundException('Tag no encontrado');
		return await this.db.tag.softDelete({ id });
	}

	async restore(id: number) {
		const tag = await this.db.tag.findFirst({
			where: { id, deletedAt: { not: null } },
		});
		if (!tag) {
			throw new NotFoundException('Tag no encontrado o aun no fue eliminado');
		}
		return await this.db.tag.update({
			where: { id },
			data: { deletedAt: null },
		});
	}

	connectTags(tags?: string[]) {
		return tags
			? {
					create: tags.map((tName) => ({
						tag: { connect: { name: tName } },
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
}
