import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagDto } from './dto/tag.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Role } from '@lib/constants/role.enum';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';

@Controller('tags')
@ApiTags('Tags')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Post()
    @ApiResponse({ type: TagDto, description: 'Etiqueta creada correctamente' })
    @ApiBody({ type: CreateTagDto })
    create(@Body() dto: CreateTagDto) {
        return this.tagService.create(dto);
    }

    @Get(':id')
    @ApiResponse({ type: TagDto })
    findOne(@Param('id', IdValidationPipe) id: number) {
        return this.tagService.findOne(id);
    }

    @Patch(':id')
    @ApiResponse({ type: TagDto, description: 'Etiqueta actualizada correctamente' })
    @ApiBody({ type: UpdateTagDto })
    update(@Param('id', IdValidationPipe) id: number, @Body() dto: UpdateTagDto) {
        return this.tagService.update(id, dto);
    }


    @Delete(':id')
    @ApiResponse({ description: 'Etiqueta eliminada correctamente' })
    remove(@Param('id', IdValidationPipe) id: number) {
        return this.tagService.remove(id);
    }
}
