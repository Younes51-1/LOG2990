import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VideoReplay } from '@app/interfaces/video-replay';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-video-replay-dialog',
    templateUrl: './video-replay-dialog.component.html',
    styleUrls: ['./video-replay-dialog.component.scss'],
})
export class VideoReplayDialogComponent implements AfterViewInit {
    speed = 1;
    time: number = 0;
    timer: ReturnType<typeof setInterval>;
    minutes: number;
    seconds: number;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { videoReplay: VideoReplay }) {}

    ngAfterViewInit(): void {
        this.startTimer();
        // actions = data.videoreplay.actions //actions doit etre une queue
        // actionsDeepCopy = action;
        this.replay();
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
        // ...
    }

    getMinutes() {
        return Math.floor(this.time / Time.MinInSec);
    }

    getSeconds() {
        return this.time % Time.MinInSec;
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
