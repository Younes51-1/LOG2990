import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { GameData } from '@app/interfaces/game-data';
import { Timer } from '@app/interfaces/timer';
import { DifferencesFoundService } from '@app/services/differencesFound/differences-found.service';

enum Times {
    MinInSec = 60,
    SecInMil = 1000,
    TenSec = 10,
}
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnChanges, OnDestroy {
    @Input() gameName: string;
    @Input() gameData: GameData;
    @Input() timer: Timer;

    gameMode = 'Classic mode';
    difficulty = 'Easy mode';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    totalNumber: number;
    differencesFound = 0;
    dialogOpened = false;

    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    intervalId = 0;

    constructor(private differencesFoundService: DifferencesFoundService, private dialog: MatDialog) {
        this.differencesFoundService.differencesFound$.subscribe((count) => {
            this.differencesFound = count;
        });
    }
    ngOnChanges() {
        this.totalNumber = this.gameData.gameForm.nbDifference;
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;

        this.intervalId = window.setInterval(() => {
            this.seconds++;
            if (this.seconds === Times.MinInSec) {
                this.seconds = 0;
                this.minutes++;
            }
            if (this.differencesFound === this.totalNumber) {
                clearInterval(this.intervalId);
                if (!this.dialogOpened) {
                    this.openDialog();
                    this.dialogOpened = true;
                }
            }
        }, Times.SecInMil);
        this.difficulty = this.gameData.gameForm.difficulte;
    }
    ngOnDestroy() {
        this.differencesFoundService.resetDifferencesFound();
    }

    openDialog() {
        this.dialog.open(EndgameDialogComponent, { panelClass: 'mat-dialog-container-global', disableClose: true });
    }
}
