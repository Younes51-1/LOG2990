import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VideoReplayDialogComponent } from '@app/components/video-replay-dialog/video-replay-dialog.component';
import { VideoReplay } from '@app/interfaces/video-replay';

@Component({
    selector: 'app-endgame-modal-dialog',
    templateUrl: './endgame-dialog.component.html',
    styleUrls: ['./endgame-dialog.component.scss'],
})
export class EndgameDialogComponent {
    constructor(
        private videoReplayDialog: MatDialog,
        private dialogRef: MatDialogRef<EndgameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { gameFinished: boolean; gameWinner: boolean; videoReplay: VideoReplay },
    ) {}

    emitAbandon(abandon: boolean) {
        this.dialogRef.close(abandon);
    }

    openVideoReplay() {
        this.videoReplayDialog.open(VideoReplayDialogComponent, {
            data: { videoReplay: this.data.videoReplay },
            disableClose: true,
        });
    }
}
