import { AppController } from '@lib/decorators/router/app-controller.decorator';
import {
	Body,
	Param,
	ParseIntPipe,
	Post,
	Get,
	Query,
	UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationToUserDto } from './dto/create-notification-to-user.dto';
import { CreateNotificationBroadcastDto } from './dto/create-notification-broadcast.dto';
import { CurrentUser } from '@lib/decorators/auth/current-user.decoratot';
import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { RolesGuard } from '@lib/guard/role.guard';
import { Roles } from '@lib/decorators/auth/roles.decorators';
import { Role } from '@lib/constants/role.enum';

@UseGuards(RolesGuard)
@AppController({ name: 'notification', tag: 'Notification' })
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	getAll(
		@Query() query: NotificationQueryDto,
		@CurrentUser() user: TokenPayload,
	) {
		return this.notificationService.getAll(query, user);
	}

	@Roles(Role.Admin)
	@Post('/user/:id')
	createToUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: CreateNotificationToUserDto,
	) {
		return this.notificationService.createToUser(id, dto);
	}

	@Roles(Role.Admin)
	@Post('/broadcast')
	createBroadcast(@Body() dto: CreateNotificationBroadcastDto) {
		return this.notificationService.createBroadcast(dto);
	}
}
