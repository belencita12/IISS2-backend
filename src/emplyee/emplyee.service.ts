import { Injectable } from '@nestjs/common';
import { CreateEmplyeeDto } from './dto/create-emplyee.dto';
import { UpdateEmplyeeDto } from './dto/update-emplyee.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ImageService } from '@/image/image.service';
import { UserService } from '@/user/user.service';
import { genPassword, genUsername } from '@/lib/utils/encrypt';

@Injectable()
export class EmplyeeService {
	constructor(
		private readonly db: PrismaService,
		private readonly imgService: ImageService,
	) {}

	async create(dto: CreateEmplyeeDto) {
		const { profile, fullName, email, ...data } = dto;
		const username = genUsername(fullName);
		const password = await genPassword();
		const img = profile ? await this.imgService.create(profile) : undefined;
	}

	findAll() {
		return `This action returns all emplyee`;
	}

	findOne(id: number) {
		return `This action returns a #${id} emplyee`;
	}

	update(id: number, dto: UpdateEmplyeeDto) {
		return `This action updates a #${id} emplyee`;
	}

	remove(id: number) {
		return `This action removes a #${id} emplyee`;
	}
}
