import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { SupabaseModule } from '@/supabase/supabase.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
	imports: [SupabaseModule, PrismaModule],
	providers: [ImageService],
	exports: [ImageService],
})
export class ImageModule {}
