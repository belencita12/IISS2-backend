import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
} from 'class-validator';

export function NoDuplicateIds(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'noDuplicateNumbers',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any, _args: ValidationArguments) {
					if (!Array.isArray(value)) return false;
					const seen = new Set<number>();
					for (const num of value) {
						if (typeof num !== 'number') return false;
						if (seen.has(num)) return false;
						seen.add(num);
					}
					return true;
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property} no debe contener identificadores duplicados`;
				},
			},
		});
	};
}
