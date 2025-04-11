import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiPaginatedResponse } from '@lib/decorators/documentation/api-pagination-response.decorator';
import { AppController } from '@lib/decorators/router/app-controller.decorator';
import { AdminOnly } from '@lib/decorators/auth/admin-only.decorator';

@AppController({ name: 'role', tag: 'Role' })
@AdminOnly()
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post()
	@ApiResponse({ type: RoleDto })
	@ApiBody({ type: CreateRoleDto })
	create(@Body() dto: CreateRoleDto) {
		return this.roleService.create(dto);
	}

	@Get()
	@ApiPaginatedResponse(RoleDto)
	findAll(@Query() query: RoleQueryDto) {
		return this.roleService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: RoleDto })
	findOne(@Param('id') id: string) {
		return this.roleService.findOne(+id);
	}

	@Patch(':id')
	@ApiResponse({ type: RoleDto })
	update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
		return this.roleService.update(+id, dto);
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		return this.roleService.remove(+id);
	}
}
