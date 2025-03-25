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
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderQueryDto } from './dto/provider-query.dto';
import { ProviderDto } from './dto/provider.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';
import { IdValidationPipe } from '@lib/pipes/id-validation.pipe';


@Controller('provider')
@ApiTags('Provider')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
export class ProviderController {
    constructor(private readonly providerService: ProviderService) { }

    @Post()
    @ApiResponse({ type: ProviderDto, description: 'Proveedor creado correctamente' })
    @ApiBody({ type: CreateProviderDto })
    @Roles(Role.Admin)
    create(@Body() dto: CreateProviderDto) {
        return this.providerService.create(dto);
    }

    @Get()
    @ApiPaginatedResponse(ProviderDto)
    @Roles(Role.Admin)
    findAll(@Query() query: ProviderQueryDto) {
        return this.providerService.findAll(query);
    }

    @Get(':id')
    @ApiResponse({ type: ProviderDto })
    @Roles(Role.Admin)
    findOne(@Param('id', IdValidationPipe) id: number) {
        return this.providerService.findOne(id);
    }

    @Patch(':id')
    @ApiResponse({ type: ProviderDto ,  description: 'Proveedor actualizado correctamente'})
    @ApiBody({ type: UpdateProviderDto })
    @Roles(Role.Admin)
    update(@Param('id', IdValidationPipe) id: number, @Body() dto: UpdateProviderDto) {
        return this.providerService.update(id, dto);
    }

    @Delete(':id')
    @ApiResponse({ description: 'Proveedor eliminado correctamente' })
    remove(@Param('id', IdValidationPipe) id: number) {
        return this.providerService.remove(id);
    }
}
