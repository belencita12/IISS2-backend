import { ImageDto } from '@lib/commons/image.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Client, User, Role, Image } from '@prisma/client';

export interface ClientEntity extends Client {
	user: User & { roles: Role[]; image: Image | null };
}

export class ClientDto {
	constructor(client: ClientEntity) {
		this.id = client.id;
		this.phoneNumber = client.user.phoneNumber;
		this.adress = client.user.adress || undefined;
		this.username = client.user.username;
		this.email = client.user.email;
		this.fullName = client.user.fullName;
		this.ruc = client.user.ruc;
		this.roles = client.user.roles.map((role) => role.name);
		this.image = client.user.image
			? {
					id: client.user.image.id,
					originalUrl: client.user.image.originalUrl,
					previewUrl: client.user.image.previewUrl,
				}
			: undefined;
		this.createdAt = client.createdAt;
		this.updatedAt = client.updatedAt;
		this.deletedAt = client.deletedAt;
	}

	@ApiProperty()
	id: number;

	@ApiProperty()
	fullName: string;

	@ApiProperty()
	username: string;

	@ApiProperty()
	adress?: string;

	@ApiProperty()
	phoneNumber: string;

	@ApiProperty()
	ruc: string;

	@ApiProperty()
	email: string;

	@ApiProperty({ type: [String] })
	roles: string[];

	@ApiPropertyOptional({ type: ImageDto })
	image?: ImageDto;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	@ApiPropertyOptional()
	deletedAt: Date | null;
}
