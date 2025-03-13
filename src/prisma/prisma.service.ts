import { EnvService } from '@/env/env.service';
import { PaginationQueryDto } from '@/lib/commons/pagination-params.dto';
import { PaginationResponseDto } from '@/lib/commons/pagination-response.dto';
import { PagOutputParams } from '@/lib/types/pagination';
import { OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

export type PrismaService = ReturnType<BasePrismaService['withExtensions']>;

export class BasePrismaService extends PrismaClient implements OnModuleInit {
	constructor(private readonly env: EnvService) {
		super({
			log: env.get('PRISMA_LOG_LEVEL'),
		});
	}
	withExtensions() {
		return this.$extends({
			query: {
				$allModels: {
					async findUnique({ model, operation, args, query }) {
						args.where = { ...args.where, deletedAt: null };
						return query(args);
					},
				},
			},
			model: {
				$allModels: {
					async isExists<T>(
						this: T,
						where: Prisma.Args<T, 'findFirst'>['where'],
					): Promise<boolean> {
						const context = Prisma.getExtensionContext(this);
						const result = await (context as any).findFirst({ where });
						return !!result;
					},
					async findUniqueAndExists<T>(
						this: T,
						args: Prisma.Args<T, 'findUnique'>,
					): Promise<
						Prisma.Result<T, Prisma.Args<T, 'findUnique'>, 'findUnique'>
					> {
						const context = Prisma.getExtensionContext(this);
						const result = await (context as any).findUnique({
							...args,
							where: {
								...args.where,
								deletedAt: null,
							},
						});
						return result;
					},
					async findManyQuery<T>(
						this: T,
						query: PaginationQueryDto,
						where: Prisma.Args<T, 'findMany'>['where'],
					): Promise<PaginationResponseDto<Prisma.Result<T, 'findMany', any>>> {
						const { from, to, includeDeleted, page, size } = query;

						const dateFilter =
							from || to
								? {
										createdAt:
											from && to
												? { gte: from, lte: to }
												: from
													? { gte: from }
													: { lte: to },
									}
								: {};

						const deleteFilter = includeDeleted
							? { deletedAt: { not: null } }
							: { deletedAt: null };

						const pageSize = size || 16;
						const skip = (page - 1) * pageSize;
						const take = pageSize;

						const finalWhere = { ...where, ...dateFilter, ...deleteFilter };

						const total = await (this as any).count({ where: finalWhere });

						const data = await (this as any).findMany({
							where: finalWhere,
							skip,
							take,
							orderBy: { createdAt: Prisma.SortOrder.desc },
						});

						return {
							data,
							total,
							size: pageSize,
							prev: page > 1,
							next: page * pageSize < total,
							currentPage: page,
							totalPages: Math.ceil(total / pageSize),
						};
					},
				},
			},
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
