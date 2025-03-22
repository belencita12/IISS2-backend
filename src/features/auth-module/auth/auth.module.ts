import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { EnvModule } from '@features/global-module/env/env.module';
import { EnvService } from '@features/global-module/env/env.service';
import { UserModule } from '@features/auth-module/user/user.module';
import { EmailModule } from '@features/global-module/email/email.module';
import { JwtBlackListModule } from '@features/auth-module/jwt-black-list/jwt-black-list.module';
import { ClientModule } from '@features/client/client.module';

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [EnvModule],
			inject: [EnvService],
			useFactory: (env: EnvService) => ({
				global: true,
				signOptions: { expiresIn: env.get('JWT_EXP') },
				secret: env.get('JWT_SECRET'),
			}),
		}),
		UserModule,
		EmailModule,
		ClientModule,
		JwtBlackListModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
	exports: [AuthService, JwtModule, UserModule],
})
export class AuthModule {}
