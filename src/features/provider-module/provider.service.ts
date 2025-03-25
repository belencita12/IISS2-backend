import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@features/prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderQueryDto } from './dto/provider-query.dto';
import { ProviderDto } from './dto/provider.dto';

@Injectable()
export class ProviderService {
    constructor(private readonly db: PrismaService) { }

    async create(dto: CreateProviderDto) {
        const provider = await this.db.provider.create({
            data: {
                businessName: dto.businessName,
                description: dto.description,
                phoneNumber: dto.phoneNumber,
                ruc: dto.ruc,
            },
        });
        return new ProviderDto(provider);
    }
    async findOne(id: number) {
        const provider = await this.db.provider.findUnique({
            where: { id },
        });
        if (!provider) throw new NotFoundException('Proveedor no encontrado');
        return new ProviderDto(provider);
    }

    async update(id: number, dto: UpdateProviderDto) {
        const providerExists = await this.db.provider.findUnique({ where: { id } });
        if (!providerExists) throw new NotFoundException('Proveedor no encontrado');

        const updated = await this.db.provider.update({
            where: { id },
            data: {
                businessName: dto.businessName,
                description: dto.description,
                phoneNumber: dto.phoneNumber,
                ruc: dto.ruc,
            },
        });
        return new ProviderDto(updated);
    }

    async remove(id: number) {
        const exists = await this.db.provider.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Proveedor no encontrado');
        return await this.db.provider.delete({ where: { id } });
    }

    async findAll(dto: ProviderQueryDto) {
        const { baseWhere } = this.db.getBaseWhere(dto);
        const where: Prisma.ProviderWhereInput = {
            ...baseWhere,
            ...(dto.query ? this.getWhereByQuerySearch(dto.query) : {}),
        };

        const [providers, total] = await Promise.all([
            this.db.provider.findMany({
                ...this.db.paginate(dto),
                where,
            }),
            this.db.provider.count({ where }),
        ]);

        return this.db.getPagOutput({
            page: dto.page,
            size: dto.size,
            total,
            data: providers.map((provider) => new ProviderDto(provider)),
        });
    }

    private getWhereByQuerySearch(query?: string): Prisma.ProviderWhereInput {
        let querySearchWhere: Prisma.ProviderWhereInput = {};
        if (!query?.trim()) return querySearchWhere;

        const searchQuery = query.trim();
        querySearchWhere = {
            OR: [
                { ruc: { contains: searchQuery, mode: 'insensitive' } },
                { businessName: { contains: searchQuery, mode: 'insensitive' } },
                { phoneNumber: { contains: searchQuery } }
            ]
        };

        return querySearchWhere;
    }
}

