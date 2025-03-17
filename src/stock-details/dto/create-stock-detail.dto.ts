import { IsNotEmpty, Min } from 'class-validator';

export class CreateStockDetailDto {
	@IsNotEmpty()
	productoId: number;

	@IsNotEmpty()
	depositoId: number;

	@IsNotEmpty()
	@Min(1)
	cantidad: number;
}
