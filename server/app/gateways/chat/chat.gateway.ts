import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from '@app/gateways/chat/chat.gateway.variables';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(ChatEvents.SendMessage)
    sendMessage(socket: Socket, data: { message: string; username: string; roomId: string }): void {
        this.server.to(data.roomId).emit(ChatEvents.Message, { message: data.message, username: data.username });
        this.logger.log(`${data.username}: ${data.message}`);
    }
}
