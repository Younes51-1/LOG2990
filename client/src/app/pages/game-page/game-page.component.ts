import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { GameRoom } from '@app/interfaces/game';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { Subscription } from 'rxjs';

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
    gameRoom: GameRoom;
    dialogRef: MatDialogRef<EndgameDialogComponent>;

    private timerSubscription: Subscription;
    private differencesFoundSubscription: Subscription;
    private gameFinishedSubscription: Subscription;
    private gameRoomSubscription: Subscription;

    constructor(public dialog: MatDialog, private classicModeService: ClassicModeService) {}

    ngOnInit() {
        this.timerSubscription = this.classicModeService.timer$.subscribe((timer: number) => {
            this.timer = timer;
        });
        this.differencesFoundSubscription = this.classicModeService.differencesFound$.subscribe((count) => {
            this.differencesFound = count;
        });
        this.gameFinishedSubscription = this.classicModeService.gameFinished$.subscribe(() => {
            this.endGame();
        });
        this.gameRoomSubscription = this.classicModeService.gameRoom$.subscribe((gameRoom) => {
            this.gameRoom = gameRoom;
            this.gameName = gameRoom.userGame.gameData.gameForm.name;
            this.player = gameRoom.userGame.username1;
        });
    }

    endGame() {
        if (this.differencesFound === this.gameRoom.userGame.gameData.gameForm.nbDifference) {
            this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true });
        } else {
            this.classicModeService.endGame();
        }
    }

    ngOnDestroy() {
        this.classicModeService.endGame();
        this.dialog.closeAll();
        this.timerSubscription.unsubscribe();
        this.differencesFoundSubscription.unsubscribe();
        this.gameFinishedSubscription.unsubscribe();
        this.gameRoomSubscription.unsubscribe();
    }
}
