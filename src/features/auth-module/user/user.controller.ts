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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserQueryDto } from './dto/user-query.dto';
import { UserDto } from './dto/user.dto';
import { Role } from '@lib/constants/role.enum';
import { ApiPaginatedResponse } from '@lib/decorators/api-pagination-response.decorator';
import { Roles } from '@lib/decorators/roles.decorators';
import { RolesGuard } from '@lib/guard/role.guard';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@Controller('user')
@ApiTags('User')
@ApiBearerAuth('access-token')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	@ApiResponse({ type: UserDto })
	@ApiBody({ type: CreateUserDto })
	async create(@Body() createUserDto: CreateUserDto) {
		return await this.userService.create(createUserDto);
	}

	@Get()
	@ApiPaginatedResponse(UserDto)
	async findAll(@Query() query: UserQueryDto) {
		return await this.userService.findAll(query);
	}

	@Get(':id')
	@ApiResponse({ type: UserDto })
	async findOne(@Param('id') id: string) {
		return await this.userService.findOne(+id);
	}

	@Patch(':id')
	@Roles(Role.User)
	@ApiResponse({ type: UserDto })
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return await this.userService.update(+id, updateUserDto);
	}

	@Delete(':id')
	@Roles(Role.User)
	async remove(@Param('id') id: string) {
		await this.userService.remove(+id);
	}
}
