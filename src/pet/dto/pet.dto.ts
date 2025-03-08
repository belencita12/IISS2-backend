import { ImageDto } from '@/lib/commons/image.dto';
import { RaceDto } from '@/race/dto/race.dto';
import { SpeciesDto } from '@/species/dto/species.dto';
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
			id: pet.species.id,
			name: pet.species.name,
		};
		this.race = {
			id: pet.race.id,
			name: pet.race.name,
			speciesId: pet.race.speciesId,
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
