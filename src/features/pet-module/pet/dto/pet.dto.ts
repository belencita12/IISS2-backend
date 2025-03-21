import { RaceDto } from '@features/pet-module/race/dto/race.dto';
import { SpeciesDto } from '@features/pet-module/species/dto/species.dto';
import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class PetDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Bruce' })
	name: string;

	@ApiProperty({ type: SpeciesDto })
	species: SpeciesDto;

	@ApiProperty({ type: RaceDto })
	race: RaceDto;

	@ApiProperty({ example: 1 })
	userId: number;

	@ApiProperty({ example: 12 })
	weight: number;

	@ApiProperty({ example: 'M' })
	sex: Sex;

	@ApiPropertyOptional({ type: ImageDto })
	@IsOptional()
	profileImg?: ImageDto;

	@ApiProperty({ example: '2020-05-15T00:00:00.000Z' })
	dateOfBirth: Date;

	constructor(pet: any) {
		this.id = pet.id;
		this.name = pet.name;
		this.species = {
			id: pet.speciesId,
			name: pet.species.name,
		};
		this.race = {
			id: pet.raceId,
			name: pet.race.name,
		};
		this.userId = pet.userId;
		this.weight = pet.weight;
		this.sex = pet.sex;
		this.profileImg = pet.profileImg
			? {
					id: pet.profileImg.id,
					previewUrl: pet.profileImg.previewUrl,
					originalUrl: pet.profileImg.originalUrl,
				}
			: undefined;
		this.dateOfBirth = pet.dateOfBirth;
	}
}
