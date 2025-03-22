import { ShortWorkPositionDto } from '@features/employee-module/work-position/dto/work-position/short-work-position.dto';
import { ImageDto } from '@lib/commons/image.dto';
import { IsId } from '@lib/decorators/is-id.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Employee, User, WorkPosition, Image } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

interface EmployeeEntity extends Employee {
	position: WorkPosition;
	user: User & { image: Image | null };
}

export class EmployeeDto {
	constructor(data: EmployeeEntity) {
		this.id = data.id;
		this.fullName = data.user.fullName;
		this.email = data.user.email;
		this.ruc = data.user.ruc;
		this.adress = data.user.adress || undefined;
		this.position = new ShortWorkPositionDto(data.position);
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

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ example: 'Calle 123' })
	adress?: string;

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
