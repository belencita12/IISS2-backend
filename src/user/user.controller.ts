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
import { ApiPaginatedResponse } from '@/lib/decorators/api-pagination-response.decorator';
import { RolesGuard } from '@/lib/guard/role.guard';
import { Roles } from '@/lib/decorators/roles.decorators';
import { Role } from '@/lib/constants/role.enum';

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
		const user = await this.userService.create(createUserDto);
		return new UserDto(user);
	}

	@Get()
	@ApiPaginatedResponse(UserDto)
	async findAll(@Query() query: UserQueryDto) {
		const dataPaginated = await this.userService.findAll(query);
		dataPaginated.data = dataPaginated.data.map((user) => new UserDto(user));
		return dataPaginated;
	}

	@Get(':id')
	@ApiResponse({ type: UserDto })
	async findOne(@Param('id') id: string) {
		const user = await this.userService.findOne(+id);
		return new UserDto(user);
	}

	@Patch(':id')
	@Roles(Role.User)
	@ApiResponse({ type: UserDto })
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		const updatedUser = await this.userService.update(+id, updateUserDto);
		return new UserDto(updatedUser);
	}

	@Delete(':id')
	@Roles(Role.User)
	async remove(@Param('id') id: string) {
		await this.userService.remove(+id);
	}
}
