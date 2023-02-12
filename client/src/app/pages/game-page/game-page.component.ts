import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { UserGame } from '@app/interfaces/user-game';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    gameName: string;
    player: string;
    timer = 0;
    differencesFound = 0;
    userGame: UserGame;
    dialogRef: MatDialogRef<EndgameDialogComponent>;

    constructor(public dialog: MatDialog, private classicModeService: ClassicModeService) {}

    ngOnInit() {
        this.classicModeService.timer$.subscribe((timer: number) => {
            this.timer = timer;
        });
        this.classicModeService.differencesFound$.subscribe((count) => {
            this.differencesFound = count;
        });
        this.classicModeService.gameFinished$.subscribe(() => {
            this.endGame();
        });
        this.classicModeService.userGame$.subscribe((userGame) => {
            this.userGame = userGame;
            this.gameName = userGame.gameData.gameForm.name;
            this.player = userGame.username;
        });
    }

    ngOnDestroy() {
        this.dialog.closeAll();
        this.classicModeService.endGame();
    }

    endGame() {
        if (this.differencesFound === this.userGame.gameData.gameForm.nbDifference) {
            this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true });
        }
        this.classicModeService.endGame();
    }
}
