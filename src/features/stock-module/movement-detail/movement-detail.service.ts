import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MovementDetailQueryDto } from './dto/movement-detail-query.dto';
import { Prisma } from '@prisma/client';
import { MovementDetailDto } from './dto/movement-detail.dto';

@Injectable()
export class MovementDetailService {
	constructor(private readonly db: PrismaService) {}

	async findAll(dto: MovementDetailQueryDto) {
		return await this.filter(dto);
	}

	async findOne(id: number) {
		const detail = await this.db.movementDetail.findUnique({
			where: { id },
			...this.getInclude(),
		});
		if (!detail)
			throw new NotFoundException('Detalle del movimiento no encontrado');
		return new MovementDetailDto(detail);
	}

	private async filter(dto: MovementDetailQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.MovementDetailWhereInput = {
			...baseWhere,
			movement: { id: dto.movementId },
			product: {
				name: dto.productName
					? { contains: dto.productName, mode: 'insensitive' }
					: undefined,
			},
		};
		const [data, count] = await Promise.all([
			this.db.movementDetail.findMany({
				...this.db.paginate(dto),
				...this.getInclude(),
				where,
			}),
			this.db.movementDetail.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total: count,
			data: data.map((m) => new MovementDetailDto(m)),
		});
	}

	private getInclude() {
		return {
			include: {
				product: {
					include: {
						image: true,
						provider: true,
						prices: { where: { isActive: true } },
						costs: { where: { isActive: true } },
						tags: { include: { tag: true } },
					},
				},
			},
		};
	}
}
