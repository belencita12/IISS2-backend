import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { ImageModule } from '@/image/image.module';

@Module({
	imports: [AuthModule, PrismaModule, ImageModule],
	controllers: [EmployeeController],
	providers: [EmployeeService],
})
export class EmployeeModule {}
