import { PartialType } from '@nestjs/swagger';
import { CreateStockDetailsDto } from './create-stock-detail.dto';

export class UpdateStockDetailsDto extends PartialType(CreateStockDetailsDto) {}
