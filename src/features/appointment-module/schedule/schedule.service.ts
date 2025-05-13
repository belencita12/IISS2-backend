import { SlotDto } from '@features/appointment-module/appointment/dto/slot.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { AppointmentInfo, ShiftInfo, TimeRange } from '@lib/types/schedule';
import { getUTCStartAndEndOfDay } from '@lib/utils/date';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ScheduleService {
	constructor(private readonly db: PrismaService) {}

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

		const isEmplExists = await this.db.employee.isExists({ id: emplId });
		if (!isEmplExists) throw new NotFoundException('Empleado no encontrado');

		const [startAtDate, endAtDate, nextTime] = this.getDateRangeFromAppointment(
			designatedDate,
			designatedTime,
			duration,
		);

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

	private getDateRangeFromAppointment(
		startDate: string,
		startTime: string,
		duration: number,
	): [Date, Date, number] {
		const startAtDate = new Date(`${startDate}T${startTime}`);
		this.validateDesignatedDay(startAtDate);
		const appStart = startAtDate.getHours() * 60 + startAtDate.getMinutes();
		const appEnd = appStart + duration;
		const endAtDate = new Date(`${startDate}T${this.toStrTime(appEnd)}`);
		return [startAtDate, endAtDate, appEnd];
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
		const shiftByDay = shifts.filter((s) => s.weekDay === weekDay);
		let isOutOfShift = false;
		if (start && end) {
			isOutOfShift = shiftByDay.some(
				(s) =>
					this.toNumTime(s.startTime) <= start &&
					this.toNumTime(s.endTime) >= end,
			);
		}
		return shiftByDay.length > 0 && !isOutOfShift ? shiftByDay : null;
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

	private getBusyRanges(appointments: AppointmentInfo[]): TimeRange[] {
		return appointments.map((app) => {
			const hours = app.startAt.getHours();
			const minutes = app.startAt.getMinutes();
			const start = hours * 60 + minutes;
			const end = start + app.partialDuration;
			return { start, end };
		});
	}

	private async getAppointmentsFromEmplId(id: number, date: Date) {
		const [startOfDay, endOfDay] = getUTCStartAndEndOfDay(date);
		console.log(startOfDay, endOfDay);
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
