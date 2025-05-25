import { Injectable } from '@nestjs/common';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { DateService } from '@features/global-module/date/date.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationFilter {
	constructor(private readonly dateService: DateService) {}

	getWhere(
		base: Prisma.UserNotificationWhereInput,
		query: NotificationQueryDto,
		user: TokenPayload,
	): Prisma.UserNotificationWhereInput {
		this.validateFiltersByUser(query, user);

		const where: Prisma.UserNotificationWhereInput = {
			...base,
			notification: {
				scope: query.scope,
				type: query.type,
			},
		};

		if (query.isRead) where.isRead = query.isRead;
		if (query.userId) where.userId = query.userId;
		if (query.searchSubject) {
			where.user = {
				OR: [
					{ fullName: { contains: query.searchSubject, mode: 'insensitive' } },
					{ ruc: { contains: query.searchSubject, mode: 'insensitive' } },
					{ email: { contains: query.searchSubject, mode: 'insensitive' } },
				],
			};
		}
		if (query.searchContent) {
			where.notification = {
				OR: [
					{ title: { contains: query.searchContent, mode: 'insensitive' } },
					{
						description: { contains: query.searchContent, mode: 'insensitive' },
					},
				],
			};
		}
		if (query.fromArrivalDate || query.toArrivalDate) {
			where.arrivalDate = this.dateService.getRangeForPrisma(
				query.fromArrivalDate,
				query.toArrivalDate,
			);
		}
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
			return query;
		}
	}
}
