import { ScheduleService } from '@features/appointment-module/schedule/schedule.service';

describe('CatsController', () => {
	let scheduleService: ScheduleService;

	const mockEmployeeData = {
		appointments: [
			{
				designatedDate: new Date('2025-04-17T09:00:00'),
				service: { durationMin: 15 },
			},
		],
		position: {
			shifts: [{ weekDay: 4, startTime: '08:00', endTime: '12:00' }],
		},
	};

	beforeAll(() => {
		const prismaServiceMock = {
			employee: { findUnique: jest.fn().mockReturnValue(mockEmployeeData) },
		} as any;
		scheduleService = new ScheduleService(prismaServiceMock);
	});

	describe('findAll', () => {
		it('should return an list of time range', async () => {
			const result = await scheduleService.getScheduleByEmployeeId(
				1,
				new Date(),
			);
			console.log(result);
			expect(result).toBeDefined();
		});
	});
});
