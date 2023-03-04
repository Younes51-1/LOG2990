import { Injectable } from '@angular/core';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    message$ = new Subject<string>();

    constructor(private readonly socketService: CommunicationSocketService) {}

    handleSocket(): void {
        this.socketService.on('message', (message: string) => {
            this.message$.next(message);
        });
    }

    sendMessage(message: string, username: string, roomId: string): void {
        this.socketService.send('sendMessage', [message, username, roomId]);
    }
}
