import { PartialType } from '@nestjs/swagger';
import { CreateEmplyeeDto } from './create-emplyee.dto';

export class UpdateEmplyeeDto extends PartialType(CreateEmplyeeDto) {}
