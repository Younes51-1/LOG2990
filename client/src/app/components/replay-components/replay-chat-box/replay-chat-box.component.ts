import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Message } from '@app/interfaces/chat';
import { InstructionReplay } from '@app/interfaces/video-replay';

@Component({
    selector: 'app-replay-chat-box',
    templateUrl: './replay-chat-box.component.html',
    styleUrls: ['./replay-chat-box.component.scss'],
})
export class ReplayChatBoxComponent implements OnChanges, OnInit {
    @Input() time: number;
    @Input() actions: InstructionReplay[];
    @Input() restartSignal: boolean;
    messages: Message[] = [];
    counter: number = 0;
    username: string;
    private currentAction: InstructionReplay | undefined;
    private firstChange = true;

    ngOnInit() {
        this.currentAction = this.actions[this.counter++];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.firstChange) {
            if (changes.restartSignal) {
                this.counter = 0;
                this.messages = [];
                this.currentAction = this.actions[this.counter++];
            }
        }
        this.firstChange = false;
        if (this.currentAction && this.currentAction.message) {
            if (this.currentAction.timeStart <= this.time) {
                this.messages.push(this.currentAction.message);
                if (this.actions.length) this.currentAction = this.actions[this.counter++];
                else this.currentAction = undefined;
            }
        }
    }
}
