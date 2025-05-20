export class RangeValidation {
	static isValidRangeNum(min: number, max: number) {
		return min < max;
	}

	static isValidRangeDate(min: Date, max: Date) {
		return min < max;
	}

	static isValidRangeStr(min: string, max: string) {
		return min < max;
	}
}
