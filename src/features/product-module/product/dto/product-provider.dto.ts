import { ApiProperty } from '@nestjs/swagger';

export class ProductProvider {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;
}
