import { ApiProperty } from '@nestjs/swagger';
import { Sex } from '@prisma/client';

export class PetDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Bruce' })
	name: string;

	@ApiProperty({ example: 1 })
	speciesId: number;

	@ApiProperty({ example: 1 })
	raceId: number;

	@ApiProperty({ example: 1 })
	userId: number;

	@ApiProperty({ example: 12 })
	weight: number;

	@ApiProperty({ example: 'M' })
	sex: Sex;

	@ApiProperty({ example: 'https://image.url/profile.jpg' })
	profileImg?: string;

	@ApiProperty({ example: '2020-05-15T00:00:00.000Z' })
	dateOfBirth: Date;

	constructor(pet: any) {
		Object.assign(this, pet);
	}
}
