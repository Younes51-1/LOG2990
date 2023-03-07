import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { ChatService } from '@app/services/chatService/chat.service';
// TODO: remove this
export interface Message {
    message: string;
    username: string;
}

@Component({
    selector: 'app-opponent-sidebar',
    templateUrl: './opponent-sidebar.component.html',
    styleUrls: ['./opponent-sidebar.component.scss'],
})
export class OpponentSidebarComponent implements OnInit {
    @ViewChild('chatbox', { static: true }) chatbox: ElementRef;
    @Input() opponentDifferencesFound: number;
    @Input() gameRoom: GameRoom;
    @Input() username: string;
    @Input() opponentUsername: string;
    totalNumber: number;

    message = '';
    messages: Message[] = [];

    constructor(private chatService: ChatService) {}

    ngOnInit() {
        this.chatService.message$.subscribe((message: Message) => {
            this.messages.push(message);
            this.chatbox.nativeElement.scrollTop = this.chatbox.nativeElement.scrollHeight;
        });
    }

    sendMessage() {
        this.chatService.sendMessage(this.message, this.username, this.gameRoom.roomId);
        this.message = '';
    }

    chatInputFocus() {
        this.chatService.setIsTyping(true);
    }

    chatInputBlur() {
        this.chatService.setIsTyping(false);
    }
}
