import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../../src/features/media-module/supabase/supabase.service';
import { EnvService } from '@/env/env.service';

const envMock = {
	get: jest.fn((key: string) => {
		const env = {
			SUPABASE_URL: 'https://test.supabase.co',
			SUPABASE_KEY: 'test-key',
		};
		return env[key];
	}),
};

describe('SupabaseService', () => {
	let service: SupabaseService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: EnvService, useValue: envMock },
				{
					provide: SupabaseService,
					useFactory: (envService: EnvService) => {
						return new SupabaseService(
							envService.get('SUPABASE_URL'),
							envService.get('SUPABASE_KEY'),
						);
					},
					inject: [EnvService],
				},
			],
		}).compile();
		service = module.get<SupabaseService>(SupabaseService);
	});

	it('debería ser definido', () => {
		expect(service).toBeDefined();
	});

	it('debería obtener valores de envService correctamente', () => {
		expect(envMock.get).toHaveBeenCalledWith('SUPABASE_URL');
		expect(envMock.get).toHaveBeenCalledWith('SUPABASE_KEY');
	});
});
