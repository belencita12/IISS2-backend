import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from '@/env/env.service';
import { UserModule } from '@/user/user.module';
import { EnvModule } from '@/env/env.module';
import { EmailModule } from '@/email/email.module';
import { JwtBlackListModule } from '@/jwt-black-list/jwt-black-list.module';

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
		JwtBlackListModule,
	],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
