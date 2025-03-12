import { Module } from '@nestjs/common';
import { EnvModule } from './env/env.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from './role/role.module';
import { EmailModule } from './email/email.module';
import { JwtBlackListModule } from './jwt-black-list/jwt-black-list.module';
import { PetModule } from './pet/pet.module';
import { RaceModule } from './race/race.module';
import { SpeciesModule } from './species/species.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ImageModule } from './image/image.module';
import { ProductPriceModule } from './product-price/product-price.module';
import { ProductModule } from './product/product.module';
import { WorkPositionModule } from './work-position/work-position.module';
import { EmplyeeModule } from './emplyee/emplyee.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: validate,
			isGlobal: true,
		}),
		EnvModule,
		PrismaModule,
		UserModule,
		AuthModule,
		JwtModule,
		RoleModule,
		EmailModule,
		JwtBlackListModule,
		PetModule,
		RaceModule,
		SpeciesModule,
		SupabaseModule,
		ImageModule,
		ProductPriceModule,
		ProductModule,
		WorkPositionModule,
		EmplyeeModule,
	],
})
export class AppModule {}
