import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentDetailQueryDto } from './dto/appointment-detail-query.dto';
import { AppointmentDetailFilter } from './appointment-detail.filter';
import { AppointmentDetailMapper } from './appointment-detail.mapper';

@Injectable()
export class AppointmentDetailService {
	constructor(private readonly db: PrismaService) {}

	async findAll(query: AppointmentDetailQueryDto) {
		const { baseWhere } = this.db.getBaseWhere(query);
		const where = AppointmentDetailFilter.getWhere(baseWhere, query);
		const [data, total] = await Promise.all([
			this.db.appointmentDetail.findMany({
				...this.db.paginate(query),
				...this.getInclude(),
				where,
			}),
			this.db.appointmentDetail.count({ where }),
		]);
		return this.db.getPagOutput({
			page: query.page,
			size: query.size,
			total,
			data: data.map((detail) => AppointmentDetailMapper.toDto(detail)),
		});
	}

	async findOne(id: number) {
		const appDetail = await this.db.appointmentDetail.findUnique({
			...this.getInclude(),
			where: { id, deletedAt: null },
		});
		if (!appDetail)
			throw new NotFoundException('Detalle de cita no encontrado');
		return AppointmentDetailMapper.toDto(appDetail);
	}

	private getInclude() {
		return {
			include: {
				service: {
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
				},
			},
		};
	}
}
