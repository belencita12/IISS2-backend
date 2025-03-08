import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { SupabaseService } from '@/supabase/supabase.service';

@Module({
	imports: [SupabaseService],
	providers: [ImageService],
})
export class ImageModule {}
