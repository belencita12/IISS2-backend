import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagDto } from './dto/tag.dto';

@Injectable()
export class TagService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateTagDto) {
        const tag = await this.prisma.tag.create({ data: dto });
        return new TagDto(tag);
    }

    async findOne(id: number) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException('Etiqueta no encontrada');
        return new TagDto(tag);
    }

    async update(id: number, dto: UpdateTagDto) {
        const exists = await this.prisma.tag.isExists({ id });
        if (!exists) throw new NotFoundException('Proveedor no encontrado');

        const updated = await this.prisma.tag.update({ where: { id }, data: dto });
        return new TagDto(updated);
    }

    async remove(id: number) {
        const exists = await this.prisma.tag.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Etiqueta no encontrada');

        return await this.prisma.tag.delete({ where: { id } });
    }

    // Asignar Tag a Producto
    async assignTagToProduct(productId: number, tagId: number) {
        return this.prisma.productTag.create({
            data: { productId, tagId },
        });
    }
    // Remover Tag de un Producto
    async removeTagFromProduct(productId: number, tagId: number) {
        return this.prisma.productTag.deleteMany({
            where: { productId, tagId },
        });
    }

    // Obtener Tags de un Producto
    async getTagsByProduct(productId: number) {
        return this.prisma.productTag.findMany({
            where: { productId },
            include: { tag: true },
        });
    }
}
