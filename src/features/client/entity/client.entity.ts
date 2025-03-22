import { Client, User, Role, Image } from '@prisma/client';

export interface ClientEntity extends Client {
	user: User & { roles: Role[]; image: Image | null };
}
