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
    replayRestarted: boolean = false;
    actions: InstructionReplay[];
    counter: number = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { videoReplay: VideoReplay }) {}

    ngOnInit(): void {
        this.actions = this.data.videoReplay.actions;
        this.sortActions();
    }

    ngAfterViewInit(): void {
        this.startTimer();
        // actions = data.videoreplay.actions //actions doit etre une queue
        // actionsDeepCopy = action;
        this.replay();
    }

    sortActions(): void {
        while (this.counter < this.actions.length) {
            const action = this.actions[this.counter++];
            if (action) {
                switch (action.type) {
                    case Instruction.DiffFound:
                        this.playAreaActions.push(action);
                        break;
                    case Instruction.ChatMessage:
                        this.chatBoxActions.push(action);
                        break;
                    case Instruction.Error:
                        break;
                    case Instruction.CheatMode:
                        break;
                }
            }
        }
    }

    replay() {
        // while ( notPaused )
        //      currentAction = action.pop
        //      if(currentAction.time > time)
        //          doAction(action, speed);
        //          if (actions.length > 0)
        //              currentAction = actions.pop()
        //          else { break; }
        //
        // this.currentAction = this.data.videoReplay.actions.pop();
        // if (this.currentAction) {
        //     while (true) {
        //         if (this.currentAction.time >= this.time) {
        //         }
        //     }
        // }
    }

    pause() {
        this.stopTimer();
        // ...
    }

    continue() {
        this.startTimer();
        // ...
    }

    restart() {
        this.time = 0;
        this.counter = 0;
        this.replayRestarted = true;
        this.sortActions();
        // ...
    }

    /// /////////////////////////////////////////////////////////////////
    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            this.time++;
        }, Time.SecInMil / this.speed);
    }

    stopTimer() {
        clearInterval(this.timer);
    }
}
