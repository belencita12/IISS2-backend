import { IsDuration } from '@lib/decorators/validation/is-duration.decorator';
import { IsSlug } from '@lib/decorators/validation/is-slug.decorator';
import { IsStrLen } from '@lib/decorators/validation/is-str-len.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceTypeDto {
	@ApiProperty()
	@IsSlug()
	slug: string;

	@ApiProperty()
	@IsStrLen(5, 64)
	name: string;

	@ApiProperty()
	@IsStrLen(16, 256)
	description: string;

	@ApiProperty()
	@IsDuration()
	durationMin: number;
}
