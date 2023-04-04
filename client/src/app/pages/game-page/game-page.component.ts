import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { GameRoom } from '@app/interfaces/game';
import { ChatService } from '@app/services/chat/chat.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { GameService } from '@app/services/game/game.service';
import { HelpService } from '@app/services/help/help.service';
import { Subscription } from 'rxjs';
import { Time } from 'src/assets/variables/time';

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
    gameRoom: GameRoom;
    hintNum = 0;
    penaltyTime: number;

    private gameFinished = false;
    private dialogRef: MatDialogRef<EndgameDialogComponent>;
    private differenceThreshold = 0;
    private timerSubscription: Subscription;
    private differencesFoundSubscription: Subscription;
    private userDifferencesFoundSubscription: Subscription;
    private gameFinishedSubscription: Subscription;
    private gameRoomSubscription: Subscription;
    private abandonedGameSubscription: Subscription;

    // Need all services in constructor
    // eslint-disable-next-line max-params
    constructor(
        private dialog: MatDialog,
        private gameService: GameService,
        private chatService: ChatService,
        private router: Router,
        private helpService: HelpService,
        private configService: ConfigHttpService,
    ) {}

    ngOnInit() {
        this.username = this.gameService.username;
        this.timerSubscription = this.gameService.timer$.subscribe((timer: number) => {
            this.timer = timer;
        });
        this.configService.getConstants().subscribe((res) => {
            this.penaltyTime = res.penaltyTime;
        });
        this.differencesFoundSubscription = this.gameService.totalDifferencesFound$.subscribe((count) => {
            this.totalDifferencesFound = count;
        });
        this.userDifferencesFoundSubscription = this.gameService.userDifferencesFound$.subscribe((count) => {
            this.userDifferencesFound = count;
            this.sendEvent('success');
            if (this.userDifferencesFound >= this.differenceThreshold) {
                this.gameFinished = true;
                this.endGame();
            }
        });
        this.gameFinishedSubscription = this.gameService.gameFinished$.subscribe(() => {
            this.gameFinished = true;
            this.endGame();
        });
        this.gameRoomSubscription = this.gameService.gameRoom$.subscribe((gameRoom) => {
            this.gameRoom = gameRoom;
            this.gameName = gameRoom.userGame.gameData.gameForm.name;
            if (gameRoom.userGame.username2) {
                this.opponentUsername = gameRoom.userGame.username1 === this.username ? gameRoom.userGame.username2 : gameRoom.userGame.username1;
                this.differenceThreshold = Math.ceil(gameRoom.userGame.gameData.gameForm.nbDifference / 2);
            } else {
                this.opponentUsername = '';
                this.differenceThreshold = gameRoom.userGame.gameData.gameForm.nbDifference;
            }
        });
        this.abandonedGameSubscription = this.gameService.abandoned$.subscribe((username: string) => {
            if (username !== this.username) {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: true } });
                this.helpService.startConfetti(undefined);
            }
            this.unsubscribe();
            this.gameService.endGame(true, true);
        });
    }

    endGame() {
        if (this.gameFinished) {
            if (this.userDifferencesFound === this.differenceThreshold) {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: true } });
                this.helpService.startConfetti(undefined);
            } else {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: false } });
            }
            this.gameService.endGame(this.gameFinished, this.userDifferencesFound === this.differenceThreshold);
            this.unsubscribe();
        } else {
            this.abandonConfirmation();
        }
    }

    toggleHint() {
        if (this.hintNum < 3) {
            this.helpService.isHintModeOn = !this.helpService.isHintModeOn;
            this.helpService.hintMode(this.hintNum);
            this.sendEvent('hint');
            this.gameService.changeTime(this.penaltyTime);
            this.hintNum += 1;
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
            case 'hint':
                this.chatService.sendMessage('Indice utilisé', 'Système', this.gameRoom.roomId);
                break;
        }
    }

    ngOnDestroy() {
        this.gameService.reset();
        this.dialog.closeAll();
        clearInterval(this.helpService.intervalId);
    }

    private abandonConfirmation() {
        this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: false, gameWinner: false } });
        if (this.dialogRef) {
            this.dialogRef.afterClosed().subscribe((abandon) => {
                if (abandon) {
                    this.sendEvent('abandon');
                    this.gameService.abandonGame();
                    this.unsubscribe();
                    setTimeout(() => {
                        this.gameService.disconnectSocket();
                        this.router.navigate(['/home']);
                    }, Time.SecInMil);
                }
            });
        }
    }

    private unsubscribe() {
        this.timerSubscription.unsubscribe();
        this.differencesFoundSubscription.unsubscribe();
        this.userDifferencesFoundSubscription.unsubscribe();
        this.gameFinishedSubscription.unsubscribe();
        this.gameRoomSubscription.unsubscribe();
        this.abandonedGameSubscription.unsubscribe();
    }
}
