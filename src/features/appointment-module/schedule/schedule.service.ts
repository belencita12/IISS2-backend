import { DateTime } from 'luxon';
import { SlotDto } from '@features/appointment-module/appointment/dto/slot.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { AppointmentInfo, ShiftInfo, TimeRange } from '@lib/types/schedule';
import { getUTCStartAndEndOfDay } from '@lib/utils/date';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { EnvService } from '@features/global-module/env/env.service';

@Injectable()
export class ScheduleService {
	private readonly timeZone: string;

	constructor(
		private readonly db: PrismaService,
		private readonly envService: EnvService,
	) {
		this.timeZone = this.envService.get('SYS_TIME_ZONE');
	}

	parseZonedDate(date: string, time: string): Date {
		return DateTime.fromISO(`${date}T${time}`, {
			zone: this.timeZone,
		})
			.toUTC()
			.toJSDate();
	}

	private toDateFromMinutes(date: string, minutes: number): Date {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return DateTime.fromObject(
			{
				year: parseInt(date.split('-')[0]),
				month: parseInt(date.split('-')[1]),
				day: parseInt(date.split('-')[2]),
				hour: hours,
				minute: mins,
			},
			{ zone: this.timeZone },
		)
			.toUTC()
			.toJSDate();
	}

	toNumTime(timeStr: string) {
		const [hours, min] = timeStr.split(':');
		return parseInt(hours) * 60 + parseInt(min);
	}

	toStrTime(timeMin: number) {
		const hours = Math.floor(timeMin / 60)
			.toString()
			.padStart(2, '0');
		const min = (timeMin % 60).toString().padStart(2, '0');
		return `${hours}:${min}`;
	}

	private getDateRangeFromAppointment(
		startDate: string,
		startTime: string,
		duration: number,
	): [Date, Date, number] {
		const startAtDate = this.parseZonedDate(startDate, startTime);
		this.validateDesignatedDay(startAtDate);
		const zonedDate = DateTime.fromJSDate(startAtDate, {
			zone: this.timeZone,
		});
		const appStart = zonedDate.hour * 60 + zonedDate.minute;
		const appEnd = appStart + duration;
		const endAtDate = this.toDateFromMinutes(startDate, appEnd);
		return [startAtDate, endAtDate, appEnd];
	}

	async getScheduleByEmployeeId(emplId: number, date: Date) {
		const weekDay = date.getUTCDay();
		this.validateDesignatedDay(date);
		const emplData = await this.db.employee.findUnique({
			where: { id: emplId },
			select: this.getEmplSelectHelper(),
		});
		if (!emplData) throw new NotFoundException('El empleado no existe');
		const shiftByDay = this.isInShift(emplData.position.shifts, weekDay);
		if (!shiftByDay) {
			throw new BadRequestException(
				`${emplData.user.fullName} no trabaja en la fecha designada`,
			);
		}
		const appointments = await this.getAppointmentsFromEmplId(emplId, date);
		const busyRanges = this.getBusyRanges(appointments);
		return this.calculateScheduleByDate(shiftByDay, busyRanges);
	}

	async validateAppByEmployees(
		emplId: number,
		designatedDate: string,
		designatedTime: string,
		duration: number,
	): Promise<[Date, Date, number]> {
		if (!(this.toNumTime(designatedTime) % 5 === 0)) {
			throw new BadRequestException(
				'La hora designada no es un minuto multiplo de 5',
			);
		}

		const employee = await this.db.employee.findUnique({
			select: { ...this.getEmplSelectHelper() },
			where: { id: emplId },
		});
		if (!employee) throw new NotFoundException('Empleado no encontrado');

		const [startAtDate, endAtDate, nextTime] = this.getDateRangeFromAppointment(
			designatedDate,
			designatedTime,
			duration,
		);

		const isInShift = this.isInShift(
			employee.position.shifts,
			startAtDate.getUTCDay(),
		);

		if (!isInShift) {
			throw new BadRequestException(
				'El empleado no trabaja en la fecha designada',
			);
		}

		const isEmplScheduleOverlaped = await this.isEmplScheduleOverlaped(
			emplId,
			startAtDate,
			endAtDate,
		);

		if (isEmplScheduleOverlaped) {
			throw new BadRequestException(
				'El empleado no se encuentra disponible en la fecha dada',
			);
		}
		return [startAtDate, endAtDate, nextTime];
	}

	private async isEmplScheduleOverlaped(
		emplId: number,
		startAt: Date,
		endAt: Date,
	) {
		const emplData = await this.db.employee.findMany({
			where: {
				id: emplId,
				position: { shifts: { some: { weekDay: startAt.getUTCDay() } } },
				appointments: {
					some: {
						appointmentDetails: {
							some: {
								AND: [
									{ appointment: { status: 'PENDING' } },
									{ startAt: { lt: endAt } },
									{ endAt: { gt: startAt } },
								],
							},
						},
					},
				},
			},
			select: { id: true },
		});
		return emplData.length !== 0;
	}

	private validateDesignatedDay(date: Date) {
		const today = new Date();
		if (today.toISOString().split('T')[0] > date.toISOString().split('T')[0]) {
			throw new BadRequestException(
				'La fecha debe ser igual o posterior a la actual',
			);
		}
	}

	private isInShift(
		shifts: ShiftInfo,
		weekDay: number,
		start?: number,
		end?: number,
	) {
		if (weekDay === 0 || weekDay === 6) return null;

		const shiftByDay = shifts.filter((s) => s.weekDay === weekDay);
		if (!start || !end) return shiftByDay.length > 0 ? shiftByDay : null;

		const isWithinShift = shiftByDay.some((s) => {
			const shiftStart = this.toNumTime(s.startTime);
			const shiftEnd = this.toNumTime(s.endTime);
			return shiftStart <= start && shiftEnd >= end;
		});

		return isWithinShift ? shiftByDay : null;
	}

	private calculateScheduleByDate(shifts: ShiftInfo, busyRanges: TimeRange[]) {
		const schedule: SlotDto[] = [];
		shifts.forEach((s) => {
			const start = this.toNumTime(s.startTime);
			const end = this.toNumTime(s.endTime);
			for (let time = start; time <= end; time += 5) {
				const isOcuppy = busyRanges.some(({ start: bStart, end: bEnd }) => {
					return time >= bStart && time <= bEnd;
				});
				schedule.push({ time: this.toStrTime(time), isOcuppy });
			}
		});
		return schedule;
	}

	private getBusyRanges(appDetails: AppointmentInfo[]): TimeRange[] {
		return appDetails.map((app) => {
			const dt = DateTime.fromJSDate(app.startAt, { zone: this.timeZone });
			const start = dt.hour * 60 + dt.minute;
			const end = start + app.partialDuration;
			return { start, end };
		});
	}

	private async getAppointmentsFromEmplId(id: number, date: Date) {
		const [startOfDay, endOfDay] = getUTCStartAndEndOfDay(date);
		return await this.db.appointmentDetail.findMany({
			where: {
				appointment: { status: 'PENDING', employeeId: id },
				startAt: { gte: startOfDay },
				endAt: { lte: endOfDay },
			},
			select: { startAt: true, partialDuration: true },
		});
	}

	private getEmplSelectHelper() {
		return {
			id: true,
			user: { select: { fullName: true } },
			position: {
				select: {
					shifts: {
						select: { weekDay: true, startTime: true, endTime: true },
					},
				},
			},
		};
	}
}
