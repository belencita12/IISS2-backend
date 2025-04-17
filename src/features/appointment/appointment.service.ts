import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { AppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentService {
	constructor(private readonly db: PrismaService) {}

	async create(dto: CreateAppointmentDto, user: TokenPayload) {
		const service = await this.db.serviceType.isExists({ id: dto.serviceId });
		if (!service) throw new NotFoundException('Servicio no encontrado');

		const pet = await this.getPet(dto.petId, user);
		if (!pet) throw new NotFoundException('La mascota no fue encontrada');

		const { employeesId, ...data } = dto;

		const appointment = await this.db.appointment.create({
			data: { ...data, employee: this.connectEmployees(employeesId) },
			...this.getInclude(),
		});

		return new AppointmentDto(appointment);
	}

	findAll() {
		return `This action returns all appointment`;
	}

	async findOne(id: number) {
		const appointment = await this.db.appointment.findUnique({
			...this.getInclude(),
			where: { id },
		});

		if (!appointment)
			throw new NotFoundException('No se ha encontrado la cita');

		return new AppointmentDto(appointment);
	}

	async remove(id: number) {
		const isExists = await this.db.appointment.isExists({ id });
		if (!isExists) throw new NotFoundException('No se ha encontrado la cita');
		return await this.db.appointment.softDelete({ id });
	}

	private getInclude() {
		return {
			include: {
				pet: { include: { race: true, client: { include: { user: true } } } },
				employee: { include: { user: true } },
				service: true,
			},
		};
	}

	private connectEmployees(idList: number[]) {
		return {
			connect: idList.map((id) => ({
				id,
			})),
		};
	}

	private async getPet(petId: number, user: TokenPayload) {
		return await this.db.pet.findUnique({
			where: {
				id: petId,
				clientId: user.clientId ? user.clientId : undefined,
			},
		});
	}
}
