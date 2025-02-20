import { PrismaService } from '@/prisma.service';
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class JwtBlackListService {
	constructor(private readonly db: PrismaService) {}

	isJwtBanned = async (token: string) => {
		console.log(token);
		const tokenVef = await this.db.jwtBlackList.findUnique({
			where: {
				token,
			},
		});
		if (tokenVef) throw new HttpException('Token has been already used', 401);
	};

	addJwtToBlackList = async (token: string) => {
		await this.db.jwtBlackList.create({
			data: {
				token,
			},
		});
	};
}
