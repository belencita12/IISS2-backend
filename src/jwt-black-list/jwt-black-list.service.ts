import { PrismaService } from '@/prisma/prisma.service';
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class JwtBlackListService {
	constructor(private readonly db: PrismaService) {}

	isJwtBanned = async (token: string) => {
		const tokenVef = await this.db.jwtBlackList.isExists({ token });
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
