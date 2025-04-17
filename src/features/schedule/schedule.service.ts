import { PrismaService } from '@features/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScheduleService {
	constructor(private readonly db: PrismaService) {}

	async getScheduleByEmployeeId(emplId: number) {
		const emplWorkShifts = await this.db.employee.findUnique({
			where: { id: emplId },
			select: this.getSelectHelper(),
		});
	}

	private toNumTime(timeStr: string) {
		const [hours, min] = timeStr.split(':')[0];
		return parseInt(hours) * 60 + parseInt(min);
	}

	private toStrTime(timeMin: number) {
		const hours = Math.floor(timeMin / 60)
			.toString()
			.padStart(2, '0');
		const min = (timeMin % 60).toString().padStart(2, '0');
		return `${hours}:${min}`;
	}

	private getRange(
		from: number,
		to: number,
		type: 'str' | 'num',
		range: number = 5,
	) {
		const values: (number | string)[] = [];
		for (let i = from; i <= to; i += range) {
			if (type === 'str') values.push(this.toStrTime(i));
			else values.push(i);
		}
		return values;
	}

	private getSelectHelper() {
		return {
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
