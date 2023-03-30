import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Message } from '@app/interfaces/chat';
import { InstructionReplay } from '@app/interfaces/video-replay';

@Component({
    selector: 'app-fake-chat-box',
    templateUrl: './fake-chat-box.component.html',
    styleUrls: ['./fake-chat-box.component.scss'],
})
export class FakeChatBoxComponent implements OnChanges, OnInit {
    @Input() time: number;
    @Input() actions: InstructionReplay[];
    messages: Message[] = [];
    username: string;
    private currentAction: InstructionReplay | undefined;

    ngOnInit() {
        this.currentAction = this.actions.shift();
    }

    ngOnChanges(): void {
        if (this.currentAction && this.currentAction.message) {
            if (this.currentAction.timeStart === this.time) {
                this.messages.push(this.currentAction.message);
                if (this.actions.length) {
                    this.currentAction = this.actions.shift();
                }
            }
        }
    }
}
