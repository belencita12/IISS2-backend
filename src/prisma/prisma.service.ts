import { EnvService } from '@/env/env.service';
import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { PaginationResponseDto } from '@/lib/commons/pagination-response.dto';
import { PagOutputParams } from '@/lib/types/pagination';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor(private readonly env: EnvService) {
		super({
			log: env.get('PRISMA_LOG_LEVEL'),
		});
	}

	async onModuleInit() {
		await this.$connect();
	}

	getBaseWhere(query: PaginationQueryDto) {
		const { from, to, includeDeleted } = query;
		const dateFilter = {
			createdAt:
				from && to
					? { gte: from, lte: to }
					: from
						? { gte: from }
						: to
							? { lte: to }
							: {},
		};
		const baseWhere = {
			...dateFilter,
			...(includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null }),
		};
		return { baseWhere };
	}

	paginate(query: PaginationQueryDto) {
		const { page, size } = query;
		const pageSize = size || this.env.get('DEFAULT_PAGE_SIZE');
		const skip = (page - 1) * pageSize;
		const take = pageSize;
		return { skip, take, orderBy: { createdAt: Prisma.SortOrder.desc } };
	}

	getPagOutput<T>({
		page,
		size,
		total,
		data,
	}: PagOutputParams<T>): PaginationResponseDto<T> {
		const pagSize = size || this.env.get('DEFAULT_PAGE_SIZE');
		const totalPages = Math.ceil(total / pagSize);
		const prev = page > 1 && page <= totalPages;
		const next = page * pagSize < total;
		return {
			data,
			total,
			size: pagSize,
			prev,
			next,
			currentPage: page,
			totalPages,
		};
	}
}
