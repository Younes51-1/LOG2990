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
    paused = false;
    pauseSignal = false;
    continueSignal = false;
    restartSignal = false;
    endTimeout: ReturnType<typeof setTimeout>;

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
            else if (action.type === Instruction.Score) this.scoreBoardActions.push(action);
            else this.playAreaActions.push(action);
        }
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        this.pauseSignal = !this.pauseSignal;
        this.stopTimer();
    }

    continue() {
        if (!this.paused) return;
        this.paused = false;
        this.continueSignal = !this.continueSignal;
        this.startTimer();
    }

    restart() {
        clearTimeout(this.endTimeout);
        this.restartSignal = !this.restartSignal;
        this.time = 0;
        this.startTimer();
    }

    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            this.time++;
        }, Time.Thousand / this.speed);
    }

    stopTimer() {
        clearInterval(this.timer);
    }
}
