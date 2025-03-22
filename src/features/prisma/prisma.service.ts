import { PaginationQueryDto } from '@lib/commons/pagination-params.dto';
import { PaginationResponseDto } from '@lib/commons/pagination-response.dto';
import { PagOutputParams } from '@lib/types/pagination';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

const ExtendedPrismaClient = class {
	constructor() {
		return extendPrismaClient();
	}
} as new () => ReturnType<typeof extendPrismaClient>;

@Injectable()
export class PrismaService
	extends ExtendedPrismaClient
	implements OnModuleInit
{
	async onModuleInit() {
		await this.$connect();
	}
}

export const extendPrismaClient = () => {
	const prisma = new PrismaClient();
	const logger = new Logger('Prisma');
	const defaultPageSize = Number(process.env.DEFAULT_PAGE_SIZE) || 16;
	return prisma.$extends({
		client: {
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
					...(includeDeleted
						? { deletedAt: { not: null } }
						: { deletedAt: null }),
				};
				return { baseWhere };
			},

			paginate(query: PaginationQueryDto) {
				const { page, size } = query;
				const pageSize = size || defaultPageSize;
				const skip = (page - 1) * pageSize;
				const take = pageSize;
				return { skip, take, orderBy: { createdAt: Prisma.SortOrder.desc } };
			},

			getPagOutput<T>({
				page,
				size,
				total,
				data,
			}: PagOutputParams<T>): PaginationResponseDto<T> {
				const pagSize = size || defaultPageSize;
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
			},
		},
		query: {
			$allModels: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				async findUnique({ model, operation, args, query }) {
					args.where = { ...args.where, deletedAt: null };
					return query(args);
				},
			},
			async $allOperations({ operation, model, args, query }) {
				const result = await query(args);
				logger.debug(`${model} . ${operation} . ${JSON.stringify(args)}`);
				return result;
			},
		},
		model: {
			$allModels: {
				async isExists<T>(
					this: T,
					where: Prisma.Args<T, 'findUnique'>['where'],
				): Promise<boolean> {
					const context = Prisma.getExtensionContext(this);
					const result = await (context as any).findUnique({ where });
					return !!result;
				},
				async softDelete<T>(
					this: T,
					where: Prisma.Args<T, 'update'>['where'],
				): Promise<void> {
					const context = Prisma.getExtensionContext(this);
					await (context as any).update({
						where,
						data: { deletedAt: new Date() },
					});
				},
			},
		},
	});
};
