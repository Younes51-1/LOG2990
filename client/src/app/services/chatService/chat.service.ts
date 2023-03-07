import { Injectable } from '@angular/core';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { Subject } from 'rxjs';
// TODO: move this
export interface Message {
    message: string;
    username: string;
}

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    message$ = new Subject<Message>();
    isTyping = false;

    constructor(private readonly socketService: CommunicationSocketService) {}

    handleSocket(): void {
        this.socketService.on('message', (message: Message) => {
            this.message$.next(message);
        });
    }

    sendMessage(message: string, username: string, roomId: string): void {
        this.socketService.send('sendMessage', [message, username, roomId]);
    }

    setIsTyping(value: boolean) {
        this.isTyping = value;
    }
}
