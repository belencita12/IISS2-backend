import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
	INestApplication,
	NotFoundException,
	ValidationPipe,
} from '@nestjs/common';
import { SpeciesService } from '@/features/species/species.service';
import { SpeciesController } from '@/features/species/species.controller';
import { CreateSpeciesDto } from '@/features/species/dto/create-species.dto';
import { SpeciesDto } from '@/features/species/dto/species.dto';
import { UpdateSpeciesDto } from '@/features/species/dto/update-species.dto';
import {
	paginatedSpeciesMock,
	speciesMock,
	expSpeciesMock,
} from '@test-lib/mock/species';
import { RolesGuard } from '@/lib/guard/role.guard';
import { AutoPassGuardMock, expCommonPagMock } from '@test-lib/mock/commons';

const speciesService = {
	findAll: jest.fn().mockImplementation(({ page: currentPage, size }) => {
		return {
			...paginatedSpeciesMock,
			currentPage,
			size,
		};
	}),
	findOne: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return speciesMock;
		else throw new NotFoundException(`Especie con id ${id} no encontrada`);
	}),
	create: jest
		.fn()
		.mockImplementation((createSpeciesDto: CreateSpeciesDto): SpeciesDto => {
			return { ...speciesMock, ...createSpeciesDto };
		}),
	update: jest.fn().mockImplementation((id: number, dto: UpdateSpeciesDto) => {
		if (id === 1) return { ...speciesMock, ...dto };
		else throw new NotFoundException(`Especie con id ${id} no encontrada`);
	}),
	remove: jest.fn().mockImplementation((id: number) => {
		if (id === 1) return { ...speciesMock, deletedAt: new Date() };
		else throw new NotFoundException(`Especie con id ${id} no encontrada`);
	}),
};

describe('SpeciesController (e2e)', () => {
	let app: INestApplication;
	const setupApp = async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [SpeciesController],
			providers: [{ provide: SpeciesService, useValue: speciesService }],
		})
			.overrideGuard(RolesGuard)
			.useValue(AutoPassGuardMock)
			.compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ transform: true }));
		await app.init();
	};

	beforeAll(setupApp);
	afterAll(async () => await app.close());

	describe('GET /species', () => {
		it('Retorna una lista de especies con los parámetros de query page=1 y size=20', async () => {
			const size = 20;
			const page = 1;
			const url = `/species?page=${page}&size=${size}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);
			expect(response.body).toMatchObject({
				...expCommonPagMock,
				currentPage: page,
				size,
			});
			expect(speciesService.findAll).toHaveBeenCalledWith({
				page,
				size,
				includeDeleted: false,
			});
		});
	});

	describe('GET /species/:id', () => {
		it('Retorna error 404 si el id de la especie no existe', async () => {
			const url = `/species/${speciesMock.id + 1}`;
			await request(app.getHttpServer()).get(url).expect(404);
		});

		it('Retorna la especie correspondiente cuando el id es válido', async () => {
			const url = `/species/${speciesMock.id}`;
			const response = await request(app.getHttpServer()).get(url).expect(200);
			expect(response.body).toEqual(expSpeciesMock);
		});
	});

	describe('POST /species', () => {
		it('Crea una nueva especie correctamente', async () => {
			const url = '/species';
			const newSpecies: CreateSpeciesDto = { name: 'Reptil' };
			const response = await request(app.getHttpServer())
				.post(url)
				.send(newSpecies)
				.expect(201);
			expect(response.body).toMatchObject(newSpecies);
		});

		it('Retorna error 400 si falta el campo name', async () => {
			await request(app.getHttpServer()).post('/species').send({}).expect(400);
		});
	});

	describe('PATCH /species/:id', () => {
		it('Actualiza una especie correctamente', async () => {
			const url = `/species/${speciesMock.id}`;
			const updateData: UpdateSpeciesDto = { name: 'Ave' };
			const response = await request(app.getHttpServer())
				.patch(url)
				.send(updateData)
				.expect(200);
			expect(response.body).toMatchObject(updateData);
		});
	});

	describe('DELETE /species/:id', () => {
		it('Elimina una especie correctamente', async () => {
			const url = `/species/${speciesMock.id}`;
			await request(app.getHttpServer()).delete(url).expect(200);
			expect(speciesService.remove).toHaveBeenCalledWith(speciesMock.id);
		});

		it('Retorna error 404 si intenta eliminar una especie inexistente', async () => {
			const url = `/species/999`;
			await request(app.getHttpServer()).delete(url).expect(404);
		});
	});
});
