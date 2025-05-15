export class ColorUtils {
	static getManyRanHexColor(quantity: number) {
		const colors: string[] = [];
		for (let i = 0; i < quantity; i++) {
			colors.push(this.COL_ARRAY[i]);
		}
		return colors;
	}

	static COL_ARRAY: string[] = [
		'#001219',
		'#005f73',
		'#0a9396',
		'#94d2bd',
		'#240046',
		'#ee9b00',
		'#ca6702',
		'#bb3e03',
		'#ae2012',
		'#9b2226',
	];
}
