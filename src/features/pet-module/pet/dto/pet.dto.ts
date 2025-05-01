import { AppointmentPetOwnerDto } from '@features/appointment-module/appointment/dto/appointment-pet-owner.dto';
import { RaceDto } from '@features/pet-module/race/dto/race.dto';
import { SpeciesDto } from '@features/pet-module/species/dto/species.dto';
import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Client, Image, Pet, Race, Sex, Species, User } from '@prisma/client';

export interface PetEntity extends Pet {
	client: Client & { user: User };
	species: Species;
	race: Race;
	profileImg: Image | null;
}

export class PetDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'Bruce' })
	name: string;

	@ApiProperty({ type: SpeciesDto })
	species: SpeciesDto;

	@ApiProperty({ type: RaceDto })
	race: RaceDto;

	@ApiProperty({ type: AppointmentPetOwnerDto })
	owner: AppointmentPetOwnerDto;

	@ApiProperty({ example: 12 })
	weight: number;

	@ApiProperty({ example: 'M' })
	sex: Sex;

	@ApiPropertyOptional({ type: ImageDto })
	profileImg?: ImageDto;

	@ApiProperty({ example: '2020-05-15T00:00:00.000Z' })
	dateOfBirth: Date;

	constructor(pet: PetEntity) {
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
		this.owner = {
			id: pet.client.id,
			name: pet.client.user.fullName,
		};
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
