import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
    selector: 'app-endgame-modal-dialog',
    templateUrl: './endgame-dialog.component.html',
    styleUrls: ['./endgame-dialog.component.scss'],
})
export class EndgameDialogComponent {
    angle = { min: 60, max: 120 };
    spread = { min: 10, max: 50 };
    particleCount = { min: 40, max: 50 };

    constructor(
        public dialogRef: MatDialogRef<EndgameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { gameFinished: boolean; gameWinner: boolean },
    ) {}
    emitAbandon(abandon: boolean) {
        this.dialogRef.close(abandon);
    }
}
