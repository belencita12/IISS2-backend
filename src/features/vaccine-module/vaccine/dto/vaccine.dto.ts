import { SpeciesDto } from '@features/pet-module/species/dto/species.dto';
import {
	ProductDto,
	ProductEntity,
} from '@features/product-module/product/dto/product.dto';
import { VaccineManufacturerDto } from '@features/vaccine-module/vaccine-manufacturer/dto/vaccine-manufacturer.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Species, Vaccine, VaccineManufacturer } from '@prisma/client';

export interface VaccineEntity extends Vaccine {
	species: Species;
	manufacturer: VaccineManufacturer;
	product: ProductEntity;
}

export class VaccineDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ type: SpeciesDto })
	species: SpeciesDto;

	@ApiProperty({ example: 'Vacuna X' })
	name: string;

	@ApiProperty({ type: VaccineManufacturerDto })
	manufacturer: VaccineManufacturerDto;

	@ApiProperty({ type: ProductDto })
	product: ProductDto;

	constructor(data: VaccineEntity) {
		this.id = data.id;
		this.name = data.name;
		this.species = { id: data.speciesId, name: data.species.name };
		this.manufacturer = {
			id: data.manufacturerId,
			name: data.manufacturer.name,
		};
		this.product = new ProductDto(data.product);
	}
}
