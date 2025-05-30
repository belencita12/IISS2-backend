import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { DateService } from '@features/global-module/date/date.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationFilter {
	constructor(private readonly dateService: DateService) {}

	getWhere(
		base: Prisma.NotificationWhereInput,
		query: NotificationQueryDto,
		user: TokenPayload,
	): Prisma.NotificationWhereInput {
		this.validateFiltersByUser(query, user);
		this.validateFiltersByUser(query, user);
		const filterByUser: Prisma.NotificationWhereInput = {
			userNotifications: {
				some: {
					userId: query.userId,
					isRead: query.isRead,
					user: query.searchSubject
						? {
								OR: [
									{
										fullName: {
											contains: query.searchSubject,
											mode: 'insensitive',
										},
									},
									{
										ruc: { contains: query.searchSubject, mode: 'insensitive' },
									},
									{
										email: {
											contains: query.searchSubject,
											mode: 'insensitive',
										},
									},
								],
							}
						: undefined,
				},
			},
		};

		const filterBroadcast: Prisma.NotificationWhereInput = {
			scope: 'BROADCAST',
			userNotifications: { none: { userId: query.userId } },
		};

		const where: Prisma.NotificationWhereInput = {
			...base,
			type: query.type,
			scope: query.scope,
			description: query.searchContent
				? { contains: query.searchContent, mode: 'insensitive' }
				: undefined,
			createdAt:
				query.fromArrivalDate || query.toArrivalDate
					? this.dateService.getRangeForPrisma(
							query.fromArrivalDate,
							query.toArrivalDate,
						)
					: undefined,
			OR: [filterByUser, filterBroadcast],
		};

		return where;
	}

	private validateFiltersByUser(
		query: NotificationQueryDto,
		user: TokenPayload,
	) {
		const isAdmin = user.roles.includes('ADMIN');
		if (!isAdmin) {
			query.searchSubject = undefined;
			query.userId = user.id;
		}
		if (isAdmin && !query.userId) {
			throw new BadRequestException(
				'Se deben filtrar las notificaciones por usuario',
			);
		}
	}
}
