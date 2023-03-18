import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Message } from '@app/interfaces/chat';
import { GameRoom } from '@app/interfaces/game';
import { ChatService } from '@app/services/chatService/chat.service';
import { VerifyInputService } from '@app/services/verifyInput/verify-input.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
    @ViewChild('chatbox', { static: true }) chatbox: ElementRef;
    @Input() gameRoom: GameRoom;
    @Input() username: string;
    applyBorder = false;

    message = '';
    messages: Message[] = [];

    constructor(public chatService: ChatService, public verifyService: VerifyInputService) {}

    ngOnInit() {
        this.chatService.message$.subscribe((message: Message) => {
            this.messages.push(message);
            setTimeout(() => {
                this.chatbox.nativeElement.scrollTop = this.chatbox.nativeElement.scrollHeight;
            }, 0);
        });
    }

    sendMessage() {
        if (!this.verifyService.verify(this.message)) {
            this.applyBorder = true;
        } else {
            this.chatService.sendMessage(this.message, this.username, this.gameRoom.roomId);
            this.message = '';
            this.applyBorder = false;
        }
    }

    chatInputFocus() {
        this.chatService.setIsTyping(true);
    }

    chatInputBlur() {
        this.chatService.setIsTyping(false);
    }
}
