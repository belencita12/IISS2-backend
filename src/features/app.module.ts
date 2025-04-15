import { Module } from '@nestjs/common';
import { EnvModule } from './global-module/env/env.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './auth-module/user/user.module';
import { AuthModule } from './auth-module/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from './auth-module/role/role.module';
import { EmailModule } from './global-module/email/email.module';
import { JwtBlackListModule } from './auth-module/jwt-black-list/jwt-black-list.module';
import { PetModule } from './pet-module/pet/pet.module';
import { RaceModule } from './pet-module/race/race.module';
import { SpeciesModule } from './pet-module/species/species.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './media-module/supabase/supabase.module';
import { ImageModule } from './media-module/image/image.module';
import { ProductPriceModule } from './product-module/product-price/product-price.module';
import { ProductModule } from './product-module/product/product.module';
import { VaccineManufacturerModule } from './vaccine-module/vaccine-manufacturer/vaccine-manufacturer.module';
import { WorkPositionModule } from './employee-module/work-position/work-position.module';
import { VaccineModule } from './vaccine-module/vaccine/vaccine.module';
import { VaccineRegistryModule } from './vaccine-module/vaccine-registry/vaccine-registry.module';
import { VaccineBatchModule } from './vaccine-module/vaccine-batch/vaccine-batch.module';
import { EmployeeModule } from './employee-module/employee/employee.module';
import { StockModule } from './stock-module/stock/stock.module';
import { StockDetailsModule } from './stock-module/stock-details/stock-details.module';
import { MovementModule } from './stock-module/movement/movement.module';
import { configModuleOptions } from '@config/config-module.config';
import { ClientModule } from './client/client.module';
import { MediaModule } from './media-module/media/media.module';
import { ProviderModule } from './provider/provider.module';
import { TagModule } from './product-module/tag/tag.module';
import { PurchaseDetailModule } from './purchase-module/purchase-detail/purchase-detail.module';
import { PurchaseModule } from './purchase-module/purchase/purchase.module';
import { MovementDetailModule } from './stock-module/movement-detail/movement-detail.module';
import { InvoiceModule } from './invoice-module/invoice.module';

@Module({
	imports: [
		ConfigModule.forRoot(configModuleOptions),
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
		VaccineManufacturerModule,
		VaccineModule,
		VaccineRegistryModule,
		VaccineBatchModule,
		EmployeeModule,
		StockModule,
		StockDetailsModule,
		MovementModule,
		ClientModule,
		MediaModule,
		ProviderModule,
		TagModule,
		PurchaseModule,
		PurchaseDetailModule,
		MovementDetailModule,
		InvoiceModule,
	],
})
export class AppModule {}
