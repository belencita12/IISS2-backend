import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from '@nestjs/common';

@Injectable()
export class IdValidationPipe implements PipeTransform {
	transform(value: any, _metadata: ArgumentMetadata) {
		const numValue = parseInt(value, 10);
		if (numValue < 0 || numValue > 2147483647 || isNaN(numValue))
			throw new BadRequestException(`El valor "${value}" no es valido.`);
		return numValue;
	}
}
