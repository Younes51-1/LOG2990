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
    player2 = '';
    timer = 0;
    totalDifferencesFound = 0;
    userDifferencesFound = 0;
    multiplayerThreshold = 0;
    gameFinished = false;
    gameRoom: GameRoom;
    dialogRef: MatDialogRef<EndgameDialogComponent>;

    private timerSubscription: Subscription;
    private differencesFoundSubscription: Subscription;
    private userDifferencesFoundSubscription: Subscription;
    private gameFinishedSubscription: Subscription;
    private gameRoomSubscription: Subscription;

    constructor(public dialog: MatDialog, private classicModeService: ClassicModeService) {}

    ngOnInit() {
        this.timerSubscription = this.classicModeService.timer$.subscribe((timer: number) => {
            this.timer = timer;
        });
        this.differencesFoundSubscription = this.classicModeService.totalDifferencesFound$.subscribe((count) => {
            this.totalDifferencesFound = count;
        });
        this.userDifferencesFoundSubscription = this.classicModeService.userDifferencesFound$.subscribe((count) => {
            this.userDifferencesFound = count;
            if (this.gameRoom.userGame.username2 && this.userDifferencesFound >= this.multiplayerThreshold) {
                this.gameFinished = true;
                this.classicModeService.endGame();
            }
        });
        this.gameFinishedSubscription = this.classicModeService.gameFinished$.subscribe(() => {
            this.gameFinished = true;
            this.endGame();
        });
        this.gameRoomSubscription = this.classicModeService.gameRoom$.subscribe((gameRoom) => {
            this.gameRoom = gameRoom;
            this.gameName = gameRoom.userGame.gameData.gameForm.name;
            this.player = gameRoom.userGame.username1;
            this.player2 = gameRoom.userGame.username2!;
            if (gameRoom.userGame.gameData.gameForm.nbDifference % 2 === 0) {
                this.multiplayerThreshold = gameRoom.userGame.gameData.gameForm.nbDifference / 2;
            } else {
                this.multiplayerThreshold = (gameRoom.userGame.gameData.gameForm.nbDifference - 1) / 2;
            }
        });
    }

    endGame() {
        if (this.gameFinished) {
            if (this.totalDifferencesFound === this.gameRoom.userGame.gameData.gameForm.nbDifference) {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true });
            } else if (this.gameRoom.userGame.username2 && this.userDifferencesFound >= this.multiplayerThreshold) {
                // TODO: add a dialog for the winner in case of 2 players
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true });
            } else if (this.gameRoom.userGame.username2) {
                // TODO: add a dialog for the loser in case of 2 players
                alert(this.gameRoom.userGame.username2 ? 'Vous avez perdu' : 'Vous avez gagné');
            }
            this.classicModeService.endGame();
        } else {
            // TODO: add a dialog so the user can choose to quit or continue
            alert('Are you sure you want to quit the game?');
            this.classicModeService.endGame();
        }
    }

    ngOnDestroy() {
        this.classicModeService.endGame();
        this.dialog.closeAll();
        this.timerSubscription.unsubscribe();
        this.differencesFoundSubscription.unsubscribe();
        this.userDifferencesFoundSubscription.unsubscribe();
        this.gameFinishedSubscription.unsubscribe();
        this.gameRoomSubscription.unsubscribe();
    }
}
