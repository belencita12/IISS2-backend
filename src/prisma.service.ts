import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationQueryDto } from './lib/commons/pagination-params.dto';
import { EnvService } from './env/env.service';

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

	getBaseQuery(query: PaginationQueryDto) {
		const { from, to, includeDeleted, skip, take } = query;
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
		const pagination = {
			skip,
			take,
		};
		const orderBy = { createdAt: Prisma.SortOrder.desc };
		return { baseWhere, pagination, orderBy };
	}

	getPaginatedResponse<T>(
		pagConfig: { skip: number; take: number },
		total: number,
		data: T[],
	) {
		const { skip, take } = pagConfig;
		return { data, total, skip, take };
	}
}
