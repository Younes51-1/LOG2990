import { Component, Input, OnInit } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { ChatService } from '@app/services/chatService/chat.service';

@Component({
    selector: 'app-opponent-sidebar',
    templateUrl: './opponent-sidebar.component.html',
    styleUrls: ['./opponent-sidebar.component.scss'],
})
export class OpponentSidebarComponent implements OnInit {
    @Input() opponentDifferencesFound: number;
    @Input() gameRoom: GameRoom;
    @Input() username: string;
    totalNumber: number;

    message = '';
    messages: string[] = [];

    constructor(private chatService: ChatService) {}

    ngOnInit() {
        this.chatService.handleSocket();
        this.chatService.message$.subscribe((message: string) => {
            this.messages.push(message);
        });
    }

    sendMessage() {
        this.chatService.sendMessage(this.message, this.username, this.gameRoom.roomId);
        this.message = '';
    }
}
