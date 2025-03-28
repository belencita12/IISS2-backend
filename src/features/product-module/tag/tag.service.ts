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

    async processTags(newTags: string[]) {
        if (!newTags.length) return {};
        return {
            create: newTags.map(tag => ({
                tag: { connectOrCreate: { where: { name: tag }, create: { name: tag } } },
            }))
        };
    }
}
