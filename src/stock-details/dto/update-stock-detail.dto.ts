import { PartialType } from '@nestjs/swagger';
import { CreateStockDetailDto } from './create-stock-detail.dto';

export class UpdateStockDetailDto extends PartialType(CreateStockDetailDto) {}
