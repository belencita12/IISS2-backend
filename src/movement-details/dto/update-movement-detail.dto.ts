import { PartialType } from '@nestjs/swagger';
import { CreateMovementDetailDto } from './create-movement-detail.dto';

export class UpdateMovementDetailDto extends PartialType(CreateMovementDetailDto) {}
