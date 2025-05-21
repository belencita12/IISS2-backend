import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
} from 'class-validator';

export const NoDuplicatesBy = <T>(
	property: keyof T,
	validationOptions?: ValidationOptions,
) => {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'noDuplicatesBy',
			target: object.constructor,
			propertyName,
			options: {
				message: `No se permiten elementos duplicados por '${property as string}'`,
				...validationOptions,
			},
			constraints: [property],
			validator: {
				validate(value: any[], args: ValidationArguments) {
					const prop = args.constraints[0];
					if (!Array.isArray(value)) return false;

					const seen = new Set();
					for (const item of value) {
						const key = item?.[prop];
						if (key === undefined) continue;
						if (seen.has(key)) return false;
						seen.add(key);
					}
					return true;
				},
			},
		});
	};
};
