import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { SupabaseModule } from '@/supabase/supabase.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { ImageController } from './image.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
	imports: [SupabaseModule, PrismaModule, AuthModule],
	providers: [ImageService],
	exports: [ImageService],
	controllers: [ImageController],
})
export class ImageModule {}
