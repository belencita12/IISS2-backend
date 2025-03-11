import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkPositionService } from './work-position.service';
import { CreateWorkPositionDto } from './dto/create-work-position.dto';
import { UpdateWorkPositionDto } from './dto/update-work-position.dto';

@Controller('work-position')
export class WorkPositionController {
  constructor(private readonly workPositionService: WorkPositionService) {}

  @Post()
  create(@Body() createWorkPositionDto: CreateWorkPositionDto) {
    return this.workPositionService.create(createWorkPositionDto);
  }

  @Get()
  findAll() {
    return this.workPositionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workPositionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkPositionDto: UpdateWorkPositionDto) {
    return this.workPositionService.update(+id, updateWorkPositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workPositionService.remove(+id);
  }
}
