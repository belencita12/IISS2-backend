import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
	imports: [SupabaseModule, PrismaModule, AuthModule],
	providers: [ImageService],
	exports: [ImageService],
	controllers: [ImageController],
})
export class ImageModule {}
