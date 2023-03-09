import { Injectable } from '@angular/core';
import { Message } from '@app/interfaces/chat';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    message$ = new Subject<Message>();
    isTyping = false;

    constructor(private readonly socketService: CommunicationSocketService) {}

    handleSocket(): void {
        this.socketService.on('message', (message: Message) => {
            message.time = Date.now();
            this.message$.next(message);
        });
    }

    sendMessage(message: string, username: string, roomId: string): void {
        this.socketService.send('sendMessage', [message, username, roomId]);
    }

    setIsTyping(value: boolean): void {
        this.isTyping = value;
    }

    getIsTyping(): boolean {
        return this.isTyping;
    }
}
