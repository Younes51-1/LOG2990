import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Message } from '@app/interfaces/chat';
import { InstructionReplay } from '@app/interfaces/video-replay';

@Component({
    selector: 'app-replay-chat-box',
    templateUrl: './replay-chat-box.component.html',
    styleUrls: ['./replay-chat-box.component.scss'],
})
export class ReplayChatBoxComponent implements OnChanges, OnInit {
    @ViewChild('chatbox', { static: true }) chatbox: ElementRef;
    @Input() time: number;
    @Input() actions: InstructionReplay[];
    @Input() restartSignal: boolean;
    @Input() username: string;
    messages: Message[] = [];
    counter: number = 0;
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
                this.currentAction = this.actions[this.counter++];
            }
        }
        setTimeout(() => {
            this.chatbox.nativeElement.scrollTop = this.chatbox.nativeElement.scrollHeight;
        }, 0);
    }
}
