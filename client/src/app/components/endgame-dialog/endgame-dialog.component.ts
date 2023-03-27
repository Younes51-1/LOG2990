import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
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

    constructor(
        public classicModeService: ClassicModeService,
        private dialogRef: MatDialogRef<EndgameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { gameFinished: boolean; gameWinner: boolean; time?: number },
    ) {}

    ngOnInit() {
        // eslint-disable-next-line no-console
        console.log(this.data.gameWinner);
        if (this.data.gameWinner) {
            if (this.data.time) {
                this.time = `${Math.floor(this.data.time / Time.MinInSec)}:${(this.data.time % Time.MinInSec).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })}`;
            }
            this.classicModeService.timePosition$.subscribe((timePosition: number) => {
                // eslint-disable-next-line no-console
                console.log(timePosition);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if (timePosition === -1) return;
                timePosition++;
                if (timePosition === 1) this.timePosition = `${timePosition}er`;
                else this.timePosition = `${timePosition}eme`;
                this.bestTimeMessage = `Nouveau record de temps !
                                        Vous avez effectué un temps de ${this.time} et prenez la ${this.timePosition} place !`;
            });
        }
    }

    emitAbandon(abandon: boolean) {
        this.dialogRef.close(abandon);
    }
}
