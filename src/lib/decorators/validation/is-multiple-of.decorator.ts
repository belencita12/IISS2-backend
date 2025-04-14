import {
	Validate,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMultipleOf', async: false })
export class IsMultipleOfConstraint implements ValidatorConstraintInterface {
	validate(value: number, args: ValidationArguments) {
		const multiple = args.constraints[0];
		return typeof value === 'number' && value % multiple === 0;
	}

	defaultMessage(args: ValidationArguments) {
		const multiple = args.constraints[0];
		return `El valor debe ser un múltiplo de ${multiple}`;
	}
}

export const IsMultipleOf = (multiple: number) =>
	Validate(IsMultipleOfConstraint, [multiple]);
