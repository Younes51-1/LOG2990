import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Instruction, InstructionReplay, VideoReplay } from '@app/interfaces/video-replay';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-video-replay-dialog',
    templateUrl: './video-replay-dialog.component.html',
    styleUrls: ['./video-replay-dialog.component.scss'],
})
export class VideoReplayDialogComponent implements AfterViewInit, OnInit {
    speed = 1;
    time: number = 0;
    timer: ReturnType<typeof setInterval>;
    minutes: number;
    seconds: number;
    playAreaActions: InstructionReplay[] = [];
    scoreBoardActions: InstructionReplay[] = [];
    chatBoxActions: InstructionReplay[] = [];
    actions: InstructionReplay[];
    counter: number = 0;
    replayEnded = false;
    pauseSignal = false;
    continueSignal = false;
    restartSignal = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { videoReplay: VideoReplay }) {}

    ngOnInit(): void {
        this.actions = this.data.videoReplay.actions;
        this.sortActions();
    }

    ngAfterViewInit(): void {
        this.startTimer();
    }

    sortActions(): void {
        while (this.counter < this.actions.length) {
            const action = this.actions[this.counter++];
            if (action.type === Instruction.ChatMessage) this.chatBoxActions.push(action);
            else this.playAreaActions.push(action);
        }
    }

    pause() {
        this.pauseSignal = !this.pauseSignal;
        this.stopTimer();
    }

    continue() {
        this.continueSignal = !this.continueSignal;
        this.startTimer();
    }

    restart() {
        this.continueSignal = !this.continueSignal;
        this.restartSignal = !this.restartSignal;
        this.time = 0;
        this.replayEnded = false;
        this.startTimer();
    }

    startTimer() {
        if (!this.replayEnded) {
            this.stopTimer();
            this.timer = setInterval(() => {
                this.time++;
                if (this.time === this.actions[this.actions.length - 1].timeStart) {
                    this.stopTimer();
                    this.replayEnded = true;
                    setTimeout(() => {
                        this.pauseSignal = !this.pauseSignal;
                    }, 2 * Time.Thousand);
                }
            }, Time.Thousand / this.speed);
        }
    }

    stopTimer() {
        clearInterval(this.timer);
    }
}
