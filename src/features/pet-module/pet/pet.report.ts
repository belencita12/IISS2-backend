import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { toDate, toDateFormat } from '@lib/utils/date';
import { Injectable } from '@nestjs/common';
import { IReport } from '@lib/interfaces/report.interface';
import { PetReportQueryDto } from './dto/pet-report-query.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { PdfService } from '@features/global-module/pdf/pdf.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import {
	ReportChartConfig,
	SummaryItem,
} from '@features/global-module/pdf/pdf.types';
import { ColorUtils } from '@lib/utils/color-utils';

@Injectable()
export class PetReport implements IReport<PetReportQueryDto> {
	constructor(
		private readonly db: PrismaService,
		private readonly pdfService: PdfService,
	) {}
	async getReport(
		query: PetReportQueryDto,
		user: TokenPayload,
		response: Response,
	) {
		const pets = await this.db.pet.findMany({
			...this.getSelect(),
			where: { ...this.getRanges(query), deletedAt: null },
		});
		const [summaryItems, chartConfigs] = await this.generateSummaryData(query);
		return this.pdfService.generateCompactTablePDF(
			{
				title: 'Reporte de Mascotas',
				madeBy: `${user.fullName} con RUC: ${user.ruc}`,
				summary: summaryItems,
				charts: chartConfigs,
				rowConfig: {
					parentRowSpacing: 12,
					alwaysShowHeader: true,
					header: ['Nombre', 'Especie', 'Raza', 'Peso(Kg)', 'Sexo', 'Dueño'],
					data: pets.map((p) => ({
						values: [
							p.name,
							p.species.name,
							p.race.name,
							p.weight.toString(),
							p.sex === 'M' ? 'Macho' : 'Hembra',
							`${p.client.user.fullName} RUC:${p.client.user.ruc}`,
						],
						details: {
							header: [
								'Nombre',
								'Fabricante',
								'Dosis (ml)',
								'Fech. Aplicacion',
							],
							data: p.vaccines.map((v) => ({
								values: [
									v.vaccine.name,
									v.vaccine.manufacturer.name,
									v.dose.toString(),
									v.applicationDate ? toDate(v.applicationDate) : '-',
								],
							})),
							widths: [36, 20, 8, 36],
						},
					})),
					widths: [36, 10, 10, 8, 10, 26],
				},
			},
			response,
		);
	}

	private async generateSummaryData(
		query: PetReportQueryDto,
	): Promise<[SummaryItem[], ReportChartConfig[]]> {
		const result = await this.db.$queryRaw<
			{ speciesId: number; speciesName: string; count: number }[]
		>`
  SELECT 
    s.id AS "speciesId",
    s.name AS "speciesName",
    COUNT(p.id) AS "count"
  FROM "Pet" p
  JOIN "Species" s ON p."speciesId" = s.id
  WHERE p."deletedAt" IS NULL
  GROUP BY s.id, s.name
  ORDER BY s.name ASC;
`;
		const femalePets = await this.db.pet.count({
			where: { ...this.getRanges(query), sex: 'F' },
		});
		const registeredPets = await this.db.pet.count({
			where: { ...this.getRanges(query), deletedAt: null },
		});
		const vaccinatedPets = await this.db.pet.count({
			where: {
				...this.getRanges(query),
				vaccines: { some: { applicationDate: { not: null } } },
				deletedAt: null,
			},
		});
		const colors = ColorUtils.getManyRanHexColor(2);
		const chartConfig: ReportChartConfig[] = [
			{
				title: 'Mascotas por sexo',
				type: 'pie',
				components: [
					{
						label: 'Macho',
						value: registeredPets - femalePets,
						color: colors[0],
					},
					{
						label: 'Hembra',
						value: femalePets,
						color: colors[1],
					},
				],
			},
			{
				title: 'Mascotas con al menos 1 vacunación',
				type: 'pie',
				components: [
					{
						label: '1 >= vacunación',
						value: vaccinatedPets,
						color: colors[0],
					},
					{
						label: 'Sin vacunacas',
						value: registeredPets - vaccinatedPets,
						color: colors[1],
					},
				],
			},
			{
				title: 'Mascotas por especies',
				type: 'pie',
				components: result.map(({ speciesName, count }, i) => ({
					color: colors[i],
					value: Number(count),
					label: speciesName,
				})),
			},
		];
		const summaryItems: SummaryItem[] = [
			{
				key: 'Rango de fechas',
				value: `${toDateFormat(query.from)} a ${toDateFormat(query.to)}`,
				desc: 'Rango de fechas en las que se ha realizado este reporte',
			},
			{
				key: 'Mascotas Registradas',
				value: registeredPets.toString(),
				desc: 'Cantidad de mascotas registradas dentro del sistema',
			},
		];
		return [summaryItems, chartConfig];
	}

	private getRanges(query: PetReportQueryDto): Prisma.PetWhereInput {
		return {
			createdAt: { gte: new Date(query.from), lte: new Date(query.to) },
		};
	}

	private getSelect() {
		return {
			take: 500,
			select: {
				name: true,
				weight: true,
				sex: true,
				race: { select: { name: true } },
				species: { select: { name: true } },
				client: { select: { user: { select: { fullName: true, ruc: true } } } },
				vaccines: {
					where: { applicationDate: { not: null } },
					select: {
						dose: true,
						applicationDate: true,
						vaccine: {
							select: { name: true, manufacturer: { select: { name: true } } },
						},
					},
				},
			},
		};
	}
}
