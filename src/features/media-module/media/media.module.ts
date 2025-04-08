import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ImageModule } from '../image/image.module';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [ImageModule, PrismaModule, AuthModule],
	controllers: [MediaController],
	providers: [MediaService],
})
export class MediaModule {}
