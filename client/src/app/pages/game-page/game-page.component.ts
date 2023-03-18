import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { GameRoom } from '@app/interfaces/game';
import { ChatService } from '@app/services/chatService/chat.service';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import confetti from 'canvas-confetti';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    gameName: string;
    username: string;
    opponentUsername: string;
    timer = 0;
    totalDifferencesFound = 0;
    userDifferencesFound = 0;
    differenceThreshold = 0;
    gameFinished = false;
    abandon = false;
    gameRoom: GameRoom;
    dialogRef: MatDialogRef<EndgameDialogComponent>;
    intervalId: ReturnType<typeof setInterval>;

    private timerSubscription: Subscription;
    private differencesFoundSubscription: Subscription;
    private userDifferencesFoundSubscription: Subscription;
    private gameFinishedSubscription: Subscription;
    private gameRoomSubscription: Subscription;
    private abandonedGameSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(public dialog: MatDialog, public classicModeService: ClassicModeService, private chatService: ChatService, public router: Router) {}

    ngOnInit() {
        this.timerSubscription = this.classicModeService.timer$.subscribe((timer: number) => {
            this.timer = timer;
        });
        this.differencesFoundSubscription = this.classicModeService.totalDifferencesFound$.subscribe((count) => {
            this.totalDifferencesFound = count;
        });
        this.userDifferencesFoundSubscription = this.classicModeService.userDifferencesFound$.subscribe((count) => {
            this.userDifferencesFound = count;
            this.sendEvent('success');
            if (this.userDifferencesFound >= this.differenceThreshold) {
                this.gameFinished = true;
                this.endGame();
            }
        });
        this.gameFinishedSubscription = this.classicModeService.gameFinished$.subscribe(() => {
            this.gameFinished = true;
            this.endGame();
        });
        this.gameRoomSubscription = this.classicModeService.gameRoom$.subscribe((gameRoom) => {
            this.gameRoom = gameRoom;
            this.gameName = gameRoom.userGame.gameData.gameForm.name;
            this.username = this.classicModeService.username;
            if (gameRoom.userGame.username2) {
                this.opponentUsername = gameRoom.userGame.username1 === this.username ? gameRoom.userGame.username2 : gameRoom.userGame.username1;
                this.differenceThreshold = Math.ceil(gameRoom.userGame.gameData.gameForm.nbDifference / 2);
            } else {
                this.opponentUsername = '';
                this.differenceThreshold = gameRoom.userGame.gameData.gameForm.nbDifference;
            }
        });
        this.abandonedGameSubscription = this.classicModeService.abandoned$.subscribe((userName: string) => {
            if (userName !== this.username) {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: true } });
            }
            this.unsubscribe();
            this.classicModeService.endGame();
        });
    }

    endGame() {
        if (this.gameFinished) {
            if (this.userDifferencesFound === this.differenceThreshold) {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: true } });
                this.startConfetti();
            } else {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: false } });
            }
            this.classicModeService.endGame();
            this.unsubscribe();
        } else {
            this.abandonConfirmation();
        }
    }

    startConfetti() {
        this.intervalId = setInterval(() => {
            confetti({
                particleCount: 300,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
            });
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1000);
    }

    abandonConfirmation() {
        this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: false, gameWinner: false } });
        if (this.dialogRef) {
            this.dialogRef.afterClosed().subscribe((abandon) => {
                if (abandon) {
                    this.abandon = true;
                    this.sendEvent('abandon');
                    this.classicModeService.abandonGame();
                    this.unsubscribe();
                    setTimeout(() => {
                        this.classicModeService.disconnectSocket();
                        this.router.navigate(['/home']);
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    }, 1000);
                }
            });
        }
    }

    sendEvent(event: string) {
        switch (event) {
            case 'error':
                this.chatService.sendMessage(`Erreur par ${this.username}`, 'Système', this.gameRoom.roomId);
                break;
            case 'success':
                this.chatService.sendMessage(`Différence trouvée par ${this.username}`, 'Système', this.gameRoom.roomId);
                break;
            case 'abandon':
                this.chatService.sendMessage(`${this.username} a abandonné la partie`, 'Système', this.gameRoom.roomId);
                break;
        }
    }

    unsubscribe() {
        this.timerSubscription.unsubscribe();
        this.differencesFoundSubscription.unsubscribe();
        this.userDifferencesFoundSubscription.unsubscribe();
        this.gameFinishedSubscription.unsubscribe();
        this.gameRoomSubscription.unsubscribe();
        this.abandonedGameSubscription.unsubscribe();
    }

    ngOnDestroy() {
        this.classicModeService.reset();
        this.dialog.closeAll();
        clearInterval(this.intervalId);
    }
}
