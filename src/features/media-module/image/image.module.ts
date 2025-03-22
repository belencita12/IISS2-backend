import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { PrismaModule } from '@features/prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
	imports: [SupabaseModule, PrismaModule],
	providers: [ImageService],
	exports: [ImageService],
})
export class ImageModule {}
