import { Component, OnDestroy, OnInit } from '@angular/core';
import { DifferencesFoundService } from '@app/services/differencesFound/differences-found.service';
import { MatDialog } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';

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
export class SidebarComponent implements OnInit, OnDestroy {
    gameMode = 'Classic mode';
    difficulty = 'Easy mode';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    totalNumber = 10;
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
    ngOnInit() {
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
    }
    ngOnDestroy() {
        this.differencesFoundService.resetDifferencesFound();
    }

    openDialog() {
        this.dialog.open(EndgameDialogComponent, { panelClass: 'mat-dialog-container-global', disableClose: true });
    }
}
