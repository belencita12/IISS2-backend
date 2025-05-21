import { PrismaModule } from '@features/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';

@Module({
	imports: [PrismaModule],
	controllers: [ReceiptController],
	providers: [ReceiptService],
})
export class ReceiptModule {}
