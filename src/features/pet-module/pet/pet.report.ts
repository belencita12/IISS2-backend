import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { toDate, toDateFormat } from '@lib/utils/date';
import { Injectable, NotFoundException } from '@nestjs/common';
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
			where: { ...this.getRanges(query) },
		});
		const [summaryItems, chartConfigs] = await this.generateSummaryData(query);
		return this.pdfService.generateCompactTablePDF(
			{
				title: 'Reporte de Mascotas - Mascotas Registradas y sus Vacunas',
				madeBy: `${user.fullName} con RUC: ${user.ruc}`,
				summary: summaryItems,
				charts: chartConfigs,
				rowConfig: {
					parentRowSpacing: 12,
					alwaysShowHeader: true,
					header: [
						'Nombre',
						'Especie',
						'Raza',
						'Peso(Kg)',
						'Nacimiento',
						'Sexo',
						'Dueño',
						'Estado',
					],
					data: pets.map((p) => ({
						values: [
							p.name,
							p.species.name,
							p.race.name,
							p.weight.toString(),
							toDate(p.dateOfBirth),
							p.sex === 'M' ? 'Macho' : 'Hembra',
							`${p.client.user.fullName} RUC:${p.client.user.ruc}`,
							p.deletedAt ? 'Inactivo' : 'Activo',
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
							widths: [18, 20, 16, 46],
						},
					})),
					widths: [18, 10, 10, 6, 10, 10, 31, 5],
				},
			},
			response,
		);
	}

	private async generateSummaryData(
		query: PetReportQueryDto,
	): Promise<[SummaryItem[], ReportChartConfig[]]> {
		const species = query.speciesId
			? await this.db.species.findUnique({ where: { id: query.speciesId } })
			: null;

		if (!species && query.speciesId)
			throw new NotFoundException('No se ha encontrado la especie indicada');

		const colors = ColorUtils.getManyRanHexColor(7);

		const registeredPets = await this.db.pet.count({
			where: { ...this.getRanges(query) },
		});

		if (registeredPets === 0)
			throw new NotFoundException(
				'Los datos son insuficientes para generar un reporte',
			);

		const inactivePets = await this.db.pet.count({
			where: { ...this.getRanges(query), deletedAt: { not: null } },
		});

		const activePetsCount = registeredPets - inactivePets;

		const [speciesChartConfig, vaccinatedPetsChart, activeInactiveChart] =
			await Promise.all([
				this.genRacesChartConfig(colors, query.speciesId),
				this.genVaccinatedPetsChart(activePetsCount, query, colors),
				this.genActiveInactivePetsChart(registeredPets, inactivePets, colors),
			]);

		const summaryItems: SummaryItem[] = [
			{
				key: 'Rango de fechas',
				value: `${toDateFormat(query.from)} a ${toDateFormat(query.to)}`,
				desc: 'Rango de fechas en las que se ha realizado este reporte',
			},
			{
				key: 'Total de Mascotas Registradas',
				value: registeredPets.toString(),
				desc: 'Cantidad de mascotas activas/inactivas encontradas bajo los filtros aplicados',
			},
		];

		if (query.speciesId && species) {
			summaryItems.push({
				key: 'Especie',
				value: species.name,
				desc: 'Especie utilizada para la realización de este reporte',
			});
		}

		const chartConfigs: ReportChartConfig[] = [
			speciesChartConfig,
			vaccinatedPetsChart,
			activeInactiveChart,
		];

		if (!query.speciesId) {
			const speciesChart = await this.getSpeciesFromActivePets(query, colors);
			chartConfigs.push(speciesChart);
		}

		return [summaryItems, chartConfigs];
	}

	private async genVaccinatedPetsChart(
		totalPets: number,
		query: PetReportQueryDto,
		colors: string[],
	): Promise<ReportChartConfig> {
		const vaccinatedPets = await this.db.pet.count({
			where: {
				...this.getRanges(query),
				vaccines: { some: { applicationDate: { not: null } } },
				deletedAt: null,
			},
		});
		return {
			title: 'Mascotas activas con al menos 1 vacunación',
			type: 'pie',
			components: [
				{
					label: '1 >= vacunación',
					value: vaccinatedPets,
					color: colors[0],
				},
				{
					label: 'Sin vacunas',
					value: totalPets - vaccinatedPets,
					color: colors[1],
				},
			],
		};
	}

	private async getSpeciesFromActivePets(
		query: PetReportQueryDto,
		colors: string[],
	): Promise<ReportChartConfig> {
		const mascotasPorEspecie = await this.db.pet.groupBy({
			by: ['speciesId'],
			_count: {
				_all: true,
			},
			where: { ...this.getRanges(query), deletedAt: null },
		});
		const result = await Promise.all(
			mascotasPorEspecie.map(async (item) => {
				const especie = await this.db.species.findUnique({
					where: { id: item.speciesId },
				});
				return {
					speciesName: especie!.name,
					total: item._count._all,
				};
			}),
		);
		return {
			title: 'Cant. Mascotas activas por especie',
			type: 'pie',
			components: result.map((item, i) => ({
				label: item.speciesName,
				value: item.total,
				color: colors[i],
			})),
		};
	}

	private genActiveInactivePetsChart(
		totalPets: number,
		inactivePets: number,
		colors: string[],
	): ReportChartConfig {
		return {
			title: 'Mascotas por estado',
			type: 'pie',
			components: [
				{
					label: 'Activas',
					value: totalPets - inactivePets,
					color: colors[0],
				},
				{
					label: 'Inactivas',
					value: inactivePets,
					color: colors[1],
				},
			],
		};
	}

	private async genRacesChartConfig(
		colors: string[],
		speciesId?: number,
	): Promise<ReportChartConfig> {
		const whereCondition =
			speciesId !== undefined
				? Prisma.sql`WHERE p."deletedAt" IS NULL AND p."speciesId" = ${speciesId}`
				: Prisma.sql`WHERE p."deletedAt" IS NULL`;

		const petRaces = await this.db.$queryRaw<
			{ raceId: number; raceName: string; count: number }[]
		>(Prisma.sql`
			SELECT 
			r.id AS "raceId",
			r.name AS "raceName",
			COUNT(p.id) AS "count"
			FROM "Pet" p
			JOIN "Race" r ON p."raceId" = r.id
			${whereCondition}
			GROUP BY r.id, r.name
			ORDER BY count DESC;
  		`);
		const topRaces = petRaces.slice(0, 6);
		const otherCount = petRaces
			.slice(6)
			.reduce((acc, r) => acc + Number(r.count), 0);
		const raceChartComponents = [
			...topRaces.map((r, i) => ({
				label: r.raceName,
				value: Number(r.count),
				color: colors[i % colors.length],
			})),
			...(otherCount > 0
				? [
						{
							label: 'Otros',
							value: otherCount,
							color: colors[6],
						},
					]
				: []),
		];
		return {
			title: 'Mascotas activas por razas',
			type: 'pie',
			components: raceChartComponents,
		};
	}

	private getRanges(query: PetReportQueryDto): Prisma.PetWhereInput {
		return {
			createdAt: { gte: new Date(query.from), lte: new Date(query.to) },
			speciesId: query.speciesId,
		};
	}

	private getSelect() {
		return {
			take: 500,
			select: {
				name: true,
				weight: true,
				sex: true,
				deletedAt: true,
				dateOfBirth: true,
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
