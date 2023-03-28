import { Component, Input } from '@angular/core';
import { Message } from '@app/interfaces/chat';

@Component({
    selector: 'app-fake-chat-box',
    templateUrl: './fake-chat-box.component.html',
    styleUrls: ['./fake-chat-box.component.scss'],
})
export class FakeChatBoxComponent {
    @Input() time: number;
    messages: Message[] = [];
    username: string;
}
