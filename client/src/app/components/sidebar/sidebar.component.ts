import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
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
export class SidebarComponent implements OnInit, OnDestroy {
    @Input() gameName: string;

    gameMode = 'Classic mode';
    difficulty = 'Easy mode';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    totalNumber: number;
    differencesFound: number;

    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    intervalId = 0;

    constructor(
        private differencesFoundService: DifferencesFoundService,
        private dialog: MatDialog,
        private communicationService: CommunicationService,
    ) {
        this.differencesFoundService.differencesFound$.subscribe((count) => {
            this.differencesFound = count;
            if (this.differencesFound === this.totalNumber) {
                this.endGame();
            }
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
        }, Times.SecInMil);
        this.communicationService.getGame(this.gameName).subscribe((res) => {
            if (res.gameForm) {
                this.totalNumber = res.gameForm.nbDifference;
                this.difficulty = res.gameForm.difficulte;
            }
        });
    }
    endGame() {
        if (this.differencesFound === this.totalNumber) {
            clearInterval(this.intervalId);
            this.dialog.open(EndgameDialogComponent, { disableClose: true });
        }
    }
    ngOnDestroy() {
        this.differencesFoundService.resetDifferencesFound();
        clearInterval(this.intervalId);
    }
}
