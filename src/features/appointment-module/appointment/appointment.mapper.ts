import { Appointment, Client, Pet, Race, User } from '@prisma/client';

export interface AppointmentEntity extends Appointment {
	pet: Pet & { race: Race } & { client: Client & { user: User } };
}

export class AppointmentMapper {
	static toDto(data: AppointmentEntity) {
		return {
			id: data.id,
			designatedDate: data.designatedDate,
			details: data.details || undefined,
			status: data.status,
			completedDate: data.completedDate || undefined,
			pet: {
				id: data.petId,
				name: data.pet.name,
				race: data.pet.race.name,
				owner: {
					id: data.pet.clientId,
					name: data.pet.client.user.fullName,
				},
			},
		};
	}
}
