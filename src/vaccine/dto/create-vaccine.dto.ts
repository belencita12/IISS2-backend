import { CreateProductDto } from '@/product/dto/create-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CreateVaccineDto {
	@ApiProperty({ example: 1, required: true })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsDefined()
	speciesId: number;

	@ApiProperty({ example: 'Vacuna X', required: true })
	@IsString()
	@IsDefined()
	name: string;

	@ApiProperty({ example: 5, required: true })
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@IsDefined()
	manufacturerId: number;

	@ApiProperty({
		type: CreateProductDto,
		example: {
			name: 'Wiskas Cachorros 500gr',
			cost: 10000,
			category: 'VACCINE',
			iva: 0.1,
			price: 40000,
		},
		required: true,
	})
	@IsDefined()
	@ValidateNested()
	@Type(() => CreateProductDto)
	productData: CreateProductDto;
}
