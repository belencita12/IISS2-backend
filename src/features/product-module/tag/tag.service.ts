import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagDto } from './dto/tag.dto';

@Injectable()
export class TagService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTagDto) {
        const tag = await this.prisma.tag.create({ data: dto });
        return new TagDto(tag);
    }

    async findOne(id: number) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException('Tag no encontrada');
        return new TagDto(tag);
    }

    async update(id: number, dto: UpdateTagDto) {
        const exists = await this.prisma.tag.isExists({ id });
        if (!exists) throw new NotFoundException('Tag no encontrada');
        const updated = await this.prisma.tag.update({ where: { id }, data: dto });
        return new TagDto(updated);
    }

    async remove(id: number) {
        const exists = await this.prisma.tag.isExists({ id });
        if (!exists) throw new NotFoundException('Tag no encontrado');
        return await this.prisma.tag.delete({ where: { id } });
    }

    async getOrCreateTags(tagNames: string[]) {
        if (!tagNames.length) return [];
        const tags = tagNames.map(name => name.toLowerCase());
        const existingTags = await this.prisma.tag.findMany({
            where: { name: { in: tags } }
        });
        const existingTagNames = existingTags.map(tag => tag.name);
        const newTagNames = tags.filter(tag => !existingTagNames.includes(tag));
        if (newTagNames.length > 0) {
            await this.prisma.tag.createMany({
                data: newTagNames.map(name => ({ name })),
                skipDuplicates: true,
            });
        }
        return existingTags.map(tag => tag.id);
    }

}
