import { Module } from '@nestjs/common';
import { EmplyeeService } from './emplyee.service';
import { EmplyeeController } from './emplyee.controller';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
	imports: [AuthModule, PrismaModule],
	controllers: [EmplyeeController],
	providers: [EmplyeeService],
})
export class EmplyeeModule {}
