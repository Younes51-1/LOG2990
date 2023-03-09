import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Message } from '@app/interfaces/chat';
import { GameRoom } from '@app/interfaces/game';
import { ChatService } from '@app/services/chatService/chat.service';

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
            setTimeout(() => {
                this.chatbox.nativeElement.scrollTop = this.chatbox.nativeElement.scrollHeight;
            }, 0);
        });
    }

    sendMessage() {
        if (!this.verifyUserInput(this.message)) {
            // TODO: CSS for invalid input
            return;
        } else {
            this.chatService.sendMessage(this.message, this.username, this.gameRoom.roomId);
            this.message = '';
        }
    }

    verifyUserInput(input: string): boolean {
        if (typeof input !== 'string') {
            return false;
        }

        if (/[\u200B-\u200D\uFEFF]/.test(input)) {
            return false;
        }

        if (input.trim().length === 0) {
            return false;
        }
        // TODO: add more WORDS
        const forbiddenWords = ['foo', 'bar', 'baz'];
        const regex = new RegExp('\\b(' + forbiddenWords.join('|') + ')\\b', 'i');
        return !regex.test(input);
    }

    chatInputFocus() {
        this.chatService.setIsTyping(true);
    }

    chatInputBlur() {
        this.chatService.setIsTyping(false);
    }
}
