import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VideoReplayDialogComponent } from '@app/components/video-replay-dialog/video-replay-dialog.component';
import { VideoReplay } from '@app/interfaces/video-replay';
import { GameService } from '@app/services/game/game.service';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-endgame-modal-dialog',
    templateUrl: './endgame-dialog.component.html',
    styleUrls: ['./endgame-dialog.component.scss'],
})
export class EndgameDialogComponent implements OnInit {
    @Input() bestTimeMessage: string;

    time: string;
    timePosition: string;

    // eslint-disable-next-line max-params
    constructor(
        public gameService: GameService,
        private videoReplayDialog: MatDialog,
        private dialogRef: MatDialogRef<EndgameDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { gameFinished: boolean; gameWinner: boolean; videoReplay?: VideoReplay; time?: number; limitedTimeMode?: boolean },
    ) {}

    ngOnInit() {
        if (!this.data.gameFinished) return;
        if (this.data.gameWinner) {
            if (this.data.time) {
                this.time = `${Math.floor(this.data.time / Time.Sixty)}:${(this.data.time % Time.Sixty).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })}`;
            }
            this.gameService.timePosition$.subscribe((timePosition: number) => {
                timePosition++;
                if (timePosition === 1) this.timePosition = `${timePosition}ere`;
                else this.timePosition = `${timePosition}eme`;
                this.bestTimeMessage = `Nouveau record de temps !
                                        Vous avez effectué un temps de ${this.time} et prenez la ${this.timePosition} place !`;
            });
        }
    }

    emitAbandon(abandon: boolean) {
        this.dialogRef.close(abandon);
    }

    openVideoReplay() {
        this.videoReplayDialog.open(VideoReplayDialogComponent, {
            data: { videoReplay: this.data.videoReplay, penaltyTime: this.gameService.gameConstants.penaltyTime },
            disableClose: true,
            width: '62%',
            height: '80%',
        });
    }
}
