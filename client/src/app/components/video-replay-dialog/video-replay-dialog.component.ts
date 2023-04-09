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
    username: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { videoReplay: VideoReplay }) {}

    ngOnInit(): void {
        this.actions = this.data.videoReplay.actions;
        this.username = this.data.videoReplay.scoreboardParams.username;
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
        this.startTimer();
        this.continueSignal = !this.continueSignal;
    }

    restart() {
        clearTimeout(this.endTimeout);
        this.startTimer();
        this.time = 0;
        this.restartSignal = !this.restartSignal;
    }

    startTimer() {
        if (this.paused) return;
        this.stopTimer();
        this.timer = setInterval(() => {
            this.time++;
        }, Time.Thousand / this.speed);
    }

    incrementTimer() {
        this.time += 3;
    }

    stopTimer() {
        clearInterval(this.timer);
    }
}
