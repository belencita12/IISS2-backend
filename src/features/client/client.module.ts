import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaModule } from '@features/prisma/prisma.module';
import { ImageModule } from '@features/media-module/image/image.module';
import { ClientReport } from './client.report';

@Module({
	imports: [PrismaModule, ImageModule],
	controllers: [ClientController],
	providers: [ClientService, ClientReport],
	exports: [ClientService],
})
export class ClientModule {}
