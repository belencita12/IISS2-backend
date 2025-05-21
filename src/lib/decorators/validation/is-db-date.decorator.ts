import {
	ValidationOptions,
	registerDecorator,
	ValidationArguments,
} from 'class-validator';

export const IsDbDate = (validationOptions?: ValidationOptions) => {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'isValidDateYMD',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					if (typeof value !== 'string') return false;
					if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

					const date = new Date(value);
					if (isNaN(date.getTime())) return false;

					return true;
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property} debe tener el formato YYYY-MM-DD y ser una fecha válida`;
				},
			},
		});
	};
};
