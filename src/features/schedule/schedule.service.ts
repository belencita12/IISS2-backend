import { PrismaService } from '@features/prisma/prisma.service';
import {
	AppointmentInfo,
	ShiftInfo,
	Slot,
	TimeRange,
} from '@lib/types/schedule';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ScheduleService {
	constructor(private readonly db: PrismaService) {}

	async validateAppByEmployees(
		emplIds: number[],
		date: Date,
		duration: number,
	) {
		const emplData = await this.db.employee.findMany({
			where: this.filterManyEmpls(emplIds, date),
			select: this.getSelectHelper(date),
		});

		if (emplData.length !== emplIds.length) {
			throw new BadRequestException(
				'No todos los empleados están disponibles ese día',
			);
		}

		const appStart = date.getHours() * 60 + date.getMinutes();
		const appEnd = appStart + duration;

		for (const e of emplData) {
			const {
				position: { shifts },
				appointments,
			} = e;

			if (!this.isInShift(shifts, appStart, appEnd)) {
				throw new BadRequestException(
					`El horario de la cita esta fuera del turno de ${e.user.fullName}`,
				);
			}

			if (this.isOverlapping(appointments, appStart, appEnd)) {
				throw new BadRequestException(
					`${e.user.fullName} tiene una cita dentro de ese horario`,
				);
			}
		}
	}

	async getScheduleByEmployeeId(emplId: number, date: Date) {
		const emplData = await this.db.employee.findUnique({
			where: this.filterUniqueEmpl(emplId, date),
			select: this.getSelectHelper(date),
		});

		if (!emplData) throw new NotFoundException('Empleado no enconrado');

		const {
			position: { shifts },
			appointments,
		} = emplData;

		console.log(appointments);
		const busyRanges = this.getBusyRanges(appointments);
		return this.calculateScheduleByDate(shifts, busyRanges);
	}

	private isOverlapping(
		appointments: AppointmentInfo[],
		start: number,
		end: number,
	) {
		const busyRanges = this.getBusyRanges(appointments);
		return busyRanges.some((r) => !(end <= r.start || start >= r.end));
	}

	private isInShift(shifts: ShiftInfo, start: number, end: number) {
		return shifts.some(
			(s) =>
				this.toNumTime(s.startTime) > start || this.toNumTime(s.endTime) < end,
		);
	}

	private calculateScheduleByDate(shifts: ShiftInfo, busyRanges: TimeRange[]) {
		const schedule: Slot[] = [];
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
		return appointments.map((a) => {
			const hours = a.designatedDate.getHours();
			const minutes = a.designatedDate.getMinutes();
			const start = hours * 60 + minutes;
			const end = start + a.service.durationMin;
			return { start, end };
		});
	}

	private toNumTime(timeStr: string) {
		const [hours, min] = timeStr.split(':');
		return parseInt(hours) * 60 + parseInt(min);
	}

	private toStrTime(timeMin: number) {
		const hours = Math.floor(timeMin / 60)
			.toString()
			.padStart(2, '0');
		const min = (timeMin % 60).toString().padStart(2, '0');
		return `${hours}:${min}`;
	}

	private filterManyEmpls(emplId: number[], date: Date) {
		const weekDay = date.getDay();
		return {
			id: { in: emplId },
			position: { shifts: { some: { weekDay } } },
		};
	}

	private filterUniqueEmpl(emplId: number, date: Date) {
		const weekDay = date.getDay();
		return {
			id: emplId,
			position: { shifts: { some: { weekDay } } },
		};
	}

	private getSelectHelper(date: Date) {
		const startOfDay = new Date(
			Date.UTC(
				date.getUTCFullYear(),
				date.getUTCMonth(),
				date.getUTCDate(),
				0,
				0,
				0,
				0,
			),
		);

		const endOfDay = new Date(
			Date.UTC(
				date.getUTCFullYear(),
				date.getUTCMonth(),
				date.getUTCDate(),
				23,
				59,
				59,
			),
		);

		return {
			user: { select: { fullName: true } },
			appointments: {
				where: { designatedDate: { gte: startOfDay, lte: endOfDay } },
				select: {
					designatedDate: true,
					service: { select: { durationMin: true } },
				},
			},
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
