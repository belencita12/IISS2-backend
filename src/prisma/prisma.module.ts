import { Module } from '@nestjs/common';
import { BasePrismaService, PrismaService } from './prisma.service';
import { EnvService } from '@/env/env.service';

export const PRISMA_INJECTION_TOKEN = 'PrismaService';

@Module({
	providers: [
		{
			provide: PRISMA_INJECTION_TOKEN,

			useFactory: (envService: EnvService): PrismaService => {
				return new BasePrismaService(envService).withExtensions();
			},
			inject: [EnvService],
		},
	],
	exports: [PRISMA_INJECTION_TOKEN],
})
export class PrismaModule {}
