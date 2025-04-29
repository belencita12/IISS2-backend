import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Prisma } from '@prisma/client';
import {
	ExtendedTransaction,
	PrismaService,
} from '@features/prisma/prisma.service';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { PurchaseDto } from './dto/purchase.dto';
import { CreatePurchaseDetailDto } from '../purchase-detail/dto/create-purchase-detail.dto';
import { ProductInfoDto } from './dto/product-info.dto';

@Injectable()
export class PurchaseService {
	constructor(private readonly db: PrismaService) {}
	async create(dto: CreatePurchaseDto) {
		if (this.hasDuplicated(dto.details)) {
			throw new BadRequestException('Existen productos duplicados');
		}

		const isStock = await this.db.stock.isExists({ id: dto.stockId });
		if (!isStock) throw new NotFoundException('Depósito no encontrado');

		const isProvider = await this.db.provider.isExists({
			id: dto.providerId,
		});
		if (!isProvider) throw new NotFoundException('Proveedor no encontrado');

		return this.db.$transaction(
			async (tx: ExtendedTransaction) => {
				const { details, ...data } = dto;
				const purchase = await this.processPurchase(
					tx,
					details,
					data,
					dto.providerId,
				);
				return new PurchaseDto(purchase);
			},
			{ timeout: 15000 },
		);
	}

	async findAll(dto: PurchaseQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(dto);
		const where: Prisma.PurchaseWhereInput = {
			...baseWhere,
			stockId: dto.stockId,
			providerId: dto.providerId,
			total:
				dto.totalMin || dto.totalMax
					? {
							gte: dto.totalMin,
							lte: dto.totalMax,
						}
					: undefined,
		};
		const [data, total] = await Promise.all([
			this.db.purchase.findMany({
				...this.db.paginate(dto),
				include: { provider: true, stock: true },
				where,
			}),
			this.db.purchase.count({ where }),
		]);
		return this.db.getPagOutput({
			page: dto.page,
			size: dto.size,
			total,
			data: data.map((s) => new PurchaseDto(s)),
		});
	}

	async findOne(id: number) {
		const purchase = await this.db.purchase.findUnique({
			where: { id },
			include: { provider: true, stock: true },
		});
		if (!purchase) throw new NotFoundException('Compra no encontrado');
		return new PurchaseDto(purchase);
	}

	private async processPurchase(
		tx: ExtendedTransaction,
		details: CreatePurchaseDetailDto[],
		purchase: Omit<CreatePurchaseDto, 'details'>,
		providerId: number,
	) {
		const productsId = details.map((d) => d.productId);
		const productMap = await this.validateDetails(
			tx,
			productsId,
			details,
			providerId,
		);

		const { ivaTotal, total, detail, stockDetailData, productsData } =
			this.calculateDetails(details, productMap, purchase.stockId);

		await Promise.all(stockDetailData.map((d) => tx.stockDetails.upsert(d)));
		await Promise.all(productsData.map((d) => tx.product.update(d)));
		const newPurchase = await tx.purchase.create({
			data: {
				...purchase,
				ivaTotal,
				total,
				detail,
			},
			include: { provider: true, stock: true },
		});

		return newPurchase;
	}

	private calculateDetails(
		details: CreatePurchaseDetailDto[],
		productMap: Map<number, ProductInfoDto>,
		stockId: number,
	) {
		let ivaTotal = 0;
		let total = 0;
		const detailsData: Prisma.PurchaseDetailCreateManyPurchaseInput[] = [];
		const productsData: Prisma.ProductUpdateArgs[] = [];
		const stockDetailData: Prisma.StockDetailsUpsertArgs[] = [];

		for (const d of details) {
			const p = productMap.get(d.productId)!;
			const partialAmount = p.costs[0].cost.mul(d.quantity);

			const ivaAmount = partialAmount.mul(p.iva);
			const totalDetail = partialAmount.add(ivaAmount);

			ivaTotal += ivaAmount.toNumber();
			total += totalDetail.toNumber();

			productsData.push({
				where: { id: p.id },
				data: { quantity: { increment: d.quantity } },
			});

			stockDetailData.push({
				where: { stockId_productId: { productId: p.id, stockId } },
				update: { amount: { increment: d.quantity } },
				create: { productId: p.id, stockId, amount: d.quantity },
			});

			detailsData.push({
				productId: p.id,
				unitCost: p.costs[0].cost.toNumber(),
				partialAmount: partialAmount.toNumber(),
				partialAmountVAT: totalDetail.toNumber(),
				quantity: d.quantity,
			});
		}

		return {
			ivaTotal,
			total,
			productsData,
			stockDetailData,
			detail: {
				createMany: {
					data: detailsData,
				},
			},
		};
	}

	private async validateDetails(
		tx: ExtendedTransaction,
		prodId: number[],
		details: CreatePurchaseDetailDto[],
		providerId: number,
	) {
		const products = await tx.product.findMany({
			where: { id: { in: prodId }, providerId },
			select: {
				costs: { where: { isActive: true } },
				id: true,
				name: true,
				iva: true,
			},
		});

		if (products.length !== details.length) {
			throw new NotFoundException(
				'Existen productos que no pertenecen a ningun proveedor',
			);
		}

		return new Map(products.map((p) => [p.id, p]));
	}

	private hasDuplicated(details: CreatePurchaseDetailDto[]) {
		const seen = new Set<number>();
		for (const d of details) {
			if (seen.has(d.productId)) return true;
			seen.add(d.productId);
		}
		return false;
	}
}
