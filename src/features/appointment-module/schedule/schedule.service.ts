import { SlotDto } from '@features/appointment-module/appointment/dto/slot.dto';
import { PrismaService } from '@features/prisma/prisma.service';
import { AppointmentInfo, ShiftInfo, TimeRange } from '@lib/types/schedule';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class ScheduleService {
	constructor(private readonly db: PrismaService) {}

	async validateAppByEmployees(
		emplIds: number[],
		designatedDate: string,
		designatedTime: string,
		duration: number,
	) {
		const isMulOfFive = this.toNumTime(designatedTime) % 5 === 0;

		if (!isMulOfFive) {
			throw new BadRequestException(
				'La hora designada no es un minuto multiplo de 5',
			);
		}

		const date = new Date(`${designatedDate}T${designatedTime}`);

		this.validateDesignatedDay(date);

		const emplData = await this.db.employee.findMany({
			where: { id: { in: emplIds } },
			select: this.getSelectHelper(date),
		});

		if (emplData.length !== emplIds.length) {
			throw new BadRequestException(
				'No todos los empleados están disponibles ese día',
			);
		}

		const appStart = date.getHours() * 60 + date.getMinutes();
		const appEnd = appStart + duration;
		const weekDay = date.getUTCDay();

		for (const e of emplData) {
			const {
				position: { shifts },
				appointments,
			} = e;

			const shiftByDay = this.filterShiftsByWeekDay(shifts, weekDay);
			if (shiftByDay.length === 0) {
				throw new BadRequestException(
					`${e.user.fullName} no trabaja en la fecha designada`,
				);
			}

			if (!this.isInShift(shiftByDay, appStart, appEnd)) {
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

		return date;
	}

	async getScheduleByEmployeeId(emplId: number, date: Date) {
		const weekDay = date.getUTCDay();

		this.validateDesignatedDay(date);

		const emplData = await this.db.employee.findUnique({
			where: { id: emplId },
			select: this.getSelectHelper(date),
		});

		if (!emplData) throw new NotFoundException('El empleado no existe');

		const {
			position: { shifts },
			appointments,
		} = emplData;

		const shiftByDay = this.filterShiftsByWeekDay(shifts, weekDay);
		if (shiftByDay.length === 0) {
			throw new BadRequestException(
				`${emplData.user.fullName} no trabaja en la fecha designada`,
			);
		}

		const busyRanges = this.getBusyRanges(appointments);
		return this.calculateScheduleByDate(shiftByDay, busyRanges);
	}

	private isOverlapping(
		appointments: AppointmentInfo[],
		start: number,
		end: number,
	) {
		const busyRanges = this.getBusyRanges(appointments);
		return busyRanges.some((r) => !(end <= r.start || start >= r.end));
	}

	private validateDesignatedDay(date: Date) {
		const today = new Date();
		if (today.toISOString().split('T')[0] > date.toISOString().split('T')[0]) {
			throw new BadRequestException(
				'La fecha debe ser igual o posterior a la actual',
			);
		}
	}

	private filterShiftsByWeekDay(shifts: ShiftInfo, weekDay: number) {
		const shiftByDay = shifts.filter((s) => s.weekDay === weekDay);
		return shiftByDay;
	}

	private isInShift(shifts: ShiftInfo, start: number, end: number) {
		return shifts.some(
			(s) =>
				this.toNumTime(s.startTime) > start || this.toNumTime(s.endTime) < end,
		);
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
				where: {
					designatedDate: { gte: startOfDay, lte: endOfDay },
					status: AppointmentStatus.PENDING,
				},
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
