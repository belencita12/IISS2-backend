import { Module } from '@nestjs/common';
import { EnvModule } from './env/env.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.config';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleService } from './role/role.service';
import { RoleModule } from './role/role.module';
import { PrismaService } from './prisma.service';
import { EmailModule } from './email/email.module';
import { JwtBlackListModule } from './jwt-black-list/jwt-black-list.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: validate,
			isGlobal: true,
		}),
		EnvModule,
		UserModule,
		AuthModule,
		JwtModule,
		RoleModule,
		EmailModule,
		JwtBlackListModule,
	],
	controllers: [],
	providers: [AuthService, RoleService, PrismaService],
})
export class AppModule {}
