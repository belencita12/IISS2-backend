import { TokenPayload } from '@features/auth-module/auth/types/auth.types';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
	OnGatewayConnection,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { INotificationMessage, NotificationEvents } from './notification.types';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection {
	private readonly logger = new Logger(NotificationGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(private readonly jwtService: JwtService) {}

	sendToUser(userId: string, message: INotificationMessage) {
		this.server.to(userId).emit(NotificationEvents.NOTIFICATION, message);
	}

	sendBroadcast(message: INotificationMessage) {
		this.server.emit(NotificationEvents.NOTIFICATION, message);
	}

	async handleConnection(client: Socket) {
		try {
			const user = await this.getUserIdFromToken(client);
			this.logger.debug(
				`User id:${user.id}, email:${user.email}, name:${user.username} connected to notification gateway`,
			);
			client.join(user.id.toString());
		} catch (error) {
			this.logger.error(`Socket connection error: ${error.message}`);
			client.disconnect();
		}
	}

	private async getUserIdFromToken(client: Socket): Promise<TokenPayload> {
		const authHeader = client.handshake.headers.authorization;
		if (!authHeader) throw new UnauthorizedException('Access token not found');
		const token = authHeader.split('Bearer ')[1];
		if (!token) throw new UnauthorizedException('Access token not found');
		return await this.jwtService.verifyAsync(token);
	}
}
