import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from './chat.gateway.variables';
// TODO: remove this
export interface Message {
    message: string;
    username: string;
}
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(ChatEvents.SendMessage)
    sendMessage(socket: Socket, data: [message: string, username: string, roomId: string]) {
        this.server.to(data[2]).emit(ChatEvents.Message, { message: data[0], username: data[1] });
        this.logger.log(`${data[1]}: ${data[0]}`);
    }
}
