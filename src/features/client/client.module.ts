import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { ImageModule } from '@features/media-module/image/image.module';

@Module({
	imports: [PrismaModule, ImageModule],
	controllers: [ClientController],
	providers: [ClientService],
	exports: [ClientService],
})
export class ClientModule {}
