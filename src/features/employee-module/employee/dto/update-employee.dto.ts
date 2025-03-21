import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmplyeeDto extends PartialType(CreateEmployeeDto) {}
