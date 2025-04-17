import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	Appointment,
	AppointmentStatus,
	Client,
	Employee,
	Pet,
	Race,
	ServiceType,
	User,
} from '@prisma/client';
import { AppointmentEmployeeDto } from './appointment-employee.dto';
import { AppointmentPetDto } from './appointment-pet.dto';

export interface AppointmentEntity extends Appointment {
	pet: Pet & { race: Race } & { client: Client & { user: User } };
	employee: (Employee & { user: User })[];
	service: ServiceType;
}

export class AppointmentDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	designatedDate: Date;

	@ApiPropertyOptional()
	completedDate?: Date;

	@ApiPropertyOptional()
	details?: string;

	@ApiProperty()
	service: string;

	@ApiProperty({ type: AppointmentPetDto })
	pet: AppointmentPetDto;

	@ApiProperty({ enum: AppointmentStatus })
	status: AppointmentStatus;

	@ApiProperty({ type: [AppointmentEmployeeDto] })
	employees: AppointmentEmployeeDto[];

	constructor(data: AppointmentEntity) {
		this.id = data.id;
		this.designatedDate = data.designatedDate;
		this.details = data.details || undefined;
		this.completedDate = data.completedDate || undefined;
		this.pet = {
			id: data.petId,
			name: data.pet.name,
			race: data.pet.race.name,
			owner: {
				id: data.pet.clientId,
				name: data.pet.client.user.fullName,
			},
		};
		this.employees = data.employee.map((e) => ({
			id: e.id,
			name: e.user.fullName,
		}));
	}
}
