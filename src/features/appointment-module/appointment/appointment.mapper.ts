import {
	Appointment,
	AppointmentDetail,
	Client,
	Employee,
	Pet,
	Race,
	ServiceType,
	User,
	VaccineRegistry,
	Vaccine,
} from '@prisma/client';
import { AppointmentDto } from './dto/appointment.dto';

export interface AppointmentEntity extends Appointment {
	pet: Pet & { race: Race } & { client: Client & { user: User } };
	employee: Employee & { user: User };
	appointmentDetails: (AppointmentDetail & { service: ServiceType })[];
	vaccineRegistry?: (VaccineRegistry & { vaccine: Vaccine })[];
}

export class AppointmentMapper {
	static toDto(data: AppointmentEntity): AppointmentDto {
		return {
			id: data.id,
			designatedDate: data.designatedDate,
			details: data.details || undefined,
			status: data.status,
			completedDate: data.completedDate || undefined,
			employee: {
				id: data.employee.id,
				name: data.employee.user.fullName,
			},
			services: data.appointmentDetails.map((detail) => ({
				id: detail.serviceId,
				name: detail.service.name,
			})),
			pet: {
				id: data.petId,
				name: data.pet.name,
				race: data.pet.race.name,
				owner: {
					id: data.pet.clientId,
					name: data.pet.client.user.fullName,
				},
			},
			vaccineRegistry:
				data.vaccineRegistry?.map((reg) => ({
					id: reg.id,
					petId: reg.petId,
					dose: reg.dose,
					applicationDate: reg.applicationDate ?? undefined,
					expectedDate: reg.expectedDate,
					vaccine: {
						id: reg.vaccine.id,
						name: reg.vaccine.name,
					},
				})) ?? [],
		};
	}
}
