import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { EnvService } from '@features/global-module/env/env.service';

@Module({
	providers: [
		{
			provide: SupabaseService,
			useFactory: (env: EnvService) =>
				new SupabaseService(env.get('SUPABASE_URL'), env.get('SUPABASE_KEY')),
			inject: [EnvService],
		},
	],
	exports: [SupabaseService],
})
export class SupabaseModule {}
