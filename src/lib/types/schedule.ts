import { WorkShift } from '@prisma/client';

export type TimeRange = {
	start: number;
	end: number;
};

export type ShiftInfo = Pick<WorkShift, 'startTime' | 'endTime' | 'weekDay'>[];

export type AppointmentInfo = {
	startAt: Date;
	partialDuration: number;
};
