import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { Prisma } from '@prisma/client';
import { AppointmentQueryDto } from './dto/appointment-query.dto';

export class AppointmentFilter {
	static getWhere(
		where: Prisma.AppointmentWhereInput,
		query: AppointmentQueryDto,
		user: TokenPayload,
	) {
		const newWhere: Prisma.AppointmentWhereInput = {
			...where,
			pet: {
				id: query.petId,
				clientId: user.clientId,
				client: query.search
					? {
							user: {
								OR: [
									{ fullName: { contains: query.search, mode: 'insensitive' } },
									{ ruc: { contains: query.search, mode: 'insensitive' } },
								],
							},
						}
					: undefined,
			},
		};

		if (query.status) newWhere.status = query.status;

		if (query.fromDesignatedDate || query.toDesignatedDate) {
			newWhere.designatedDate = {
				gte: query.fromDesignatedDate
					? new Date(query.fromDesignatedDate)
					: undefined,
				lte: query.toDesignatedDate
					? new Date(`${query.toDesignatedDate}T23:59:59.000Z`)
					: undefined,
			};
		}

		if (query.employeeRuc) {
			newWhere.employee = {
				user: {
					OR: [
						{ ruc: { contains: query.employeeRuc, mode: 'insensitive' } },
						{ fullName: { contains: query.employeeRuc, mode: 'insensitive' } },
					],
				},
			};
		}
		return newWhere;
	}
}
