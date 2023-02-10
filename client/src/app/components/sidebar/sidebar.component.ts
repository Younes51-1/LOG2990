import { AfterViewInit, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { Timer } from '@app/interfaces/timer';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { DifferencesFoundService } from '@app/services/differencesFound/differences-found.service';

// enum Times {
//     MinInSec = 60,
//     SecInMil = 1000,
//     TenSec = 10,
// }
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnChanges, OnDestroy, AfterViewInit {
    @Input() gameName: string;
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

    constructor(private differencesFoundService: DifferencesFoundService, private dialog: MatDialog, private classicModeService: ClassicModeService) {
        this.differencesFoundService.differencesFound$.subscribe((count) => {
            this.differencesFound = count;
            if (this.differencesFound === this.totalNumber) {
                this.endGame();
            }
        });
    }

    ngAfterViewInit() {
        // eslint-disable-next-line no-console
        this.totalNumber = this.classicModeService.userGame.gameData.gameForm.nbDifference;
        this.difficulty = this.classicModeService.userGame.gameData.gameForm.difficulte;
    }
    ngOnChanges() {
        // this.minutes = 0;
        // this.seconds = 0;
        // this.milliseconds = 0;

        // this.intervalId = window.setInterval(() => {
        //     this.seconds++;
        //     if (this.seconds === Times.MinInSec) {
        //         this.seconds = 0;
        //         this.minutes++;
        //     }
        // }, Times.SecInMil);
        this.minutes = this.timer.minutes;
        this.seconds = this.timer.seconds;
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
