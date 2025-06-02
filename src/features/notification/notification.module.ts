import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from '@features/global-module/env/env.service';
import { PrismaModule } from '@features/prisma/prisma.module';
import { NotificationController } from './notification.controller';
import { NotificationFilter } from './notification.filter';
import { NotificationGateway } from './notification.gateway';
import { NotificationEmailService } from './notification-email.service';

@Module({
	imports: [
		PrismaModule,
		JwtModule.registerAsync({
			useFactory: (env: EnvService) => ({ secret: env.get('JWT_SECRET') }),
			inject: [EnvService],
		}),
	],
	controllers: [NotificationController],
	providers: [
		NotificationFilter,
		NotificationService,
		NotificationGateway,
		NotificationEmailService,
	],
	exports: [NotificationGateway, NotificationService, NotificationEmailService],
})
export class NotificationModule {}
