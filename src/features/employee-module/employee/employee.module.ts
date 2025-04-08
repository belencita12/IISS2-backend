import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthModule } from '@features/auth-module/auth/auth.module';
import { ImageModule } from '@features/media-module/image/image.module';
import { PrismaModule } from '@features/prisma/prisma.module';

@Module({
	imports: [AuthModule, PrismaModule, ImageModule],
	controllers: [EmployeeController],
	providers: [EmployeeService],
})
export class EmployeeModule {}
