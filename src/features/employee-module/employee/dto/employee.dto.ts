import { ShortWorkPositionDto } from '@features/employee-module/work-position/dto/work-position/short-work-position.dto';
import { ImageDto } from '@lib/commons/image.dto';
import { IsId } from '@lib/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Employee, WorkPosition } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

interface EmployeeWithDetails extends Employee {
	position: WorkPosition;
	user: {
		image: ImageDto | null;
		fullName: string;
		email: string;
		username: string;
	};
}

export class EmployeeDto {
	constructor(data: EmployeeWithDetails) {
		this.id = data.id;
		this.fullName = data.user.fullName;
		this.ruc = data.ruc;
		this.position = new ShortWorkPositionDto(data.position);
		this.email = data.user.email;
		this.image = data.user.image
			? {
					id: data.user.image.id,
					originalUrl: data.user.image.originalUrl,
					previewUrl: data.user.image.previewUrl,
				}
			: undefined;
	}

	@IsId()
	@ApiProperty({ example: 1 })
	id: number;

	@IsString()
	@IsNotEmpty()
	@IsEmail()
	@ApiProperty({ example: 'roberto.gimenez@example.com' })
	email: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Roberto Gimenez' })
	fullName: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: '12345678-1' })
	ruc: string;

	@ApiProperty({ type: ShortWorkPositionDto })
	position: ShortWorkPositionDto;

	@IsOptional()
	@ApiProperty({ type: ImageDto })
	image?: ImageDto;
}
