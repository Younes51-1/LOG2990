import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { Message } from '@app/interfaces/chat';
import { GameRoom } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { Instruction, VideoReplay } from '@app/interfaces/video-replay';
import { GameService } from '@app/services/game/game.service';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
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
    videoReplay: VideoReplay;
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
    constructor(private dialog: MatDialog, private gameService: GameService, private router: Router, private playAreaService: PlayAreaService) {}

    ngOnInit() {
        this.gameService.getConstant();
        this.timerSubscription = this.gameService.timer$.subscribe((timer: number) => {
            this.timer = timer;
        });
        this.penaltyTime = this.gameService.gameConstants.penaltyTime;
        this.differencesFoundSubscription = this.gameService.totalDifferencesFound$.subscribe((count) => {
            this.totalDifferencesFound = count;
        });
        this.userDifferencesFoundSubscription = this.gameService.userDifferencesFound$.subscribe((count) => {
            this.userDifferencesFound = count;
            this.sendEvent('success');
            if (this.userDifferencesFound >= this.differenceThreshold && this.gameService.gameMode === 'mode classique') {
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
            this.username = this.gameService.username;
            this.gameName = gameRoom.userGame.gameData.name;
            if (gameRoom.userGame.username2) {
                this.opponentUsername = gameRoom.userGame.username1 === this.username ? gameRoom.userGame.username2 : gameRoom.userGame.username1;
                this.differenceThreshold = Math.ceil(gameRoom.userGame.gameData.nbDifference / 2);
            } else {
                this.opponentUsername = '';
                this.differenceThreshold = gameRoom.userGame.gameData.nbDifference;
            }
        });
        this.abandonedGameSubscription = this.gameService.abandoned$.subscribe((username: string) => {
            if (this.gameService.gameMode === 'mode classique') {
                if (username !== this.username) {
                    this.dialogRef = this.dialog.open(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: true } });
                    this.playAreaService.startConfetti(undefined);
                }
                this.unsubscribe();
                this.gameService.endGame(true, true);
            }
        });

        this.videoReplay = {
            images: { original: '', modified: '' },
            scoreboardParams: {
                gameRoom: this.gameRoom,
                gameName: this.gameName,
                opponentUsername: this.opponentUsername,
                username: this.username,
            },
            actions: [],
            sources: [],
            cheatLayers: [],
        };
    }

    endGame() {
        if (this.gameRoom.gameMode === 'mode classique') {
            this.endGameClassicMode();
        } else {
            this.endGameLimitedTimeMode();
        }
    }

    endGameClassicMode() {
        this.videoReplay.scoreboardParams = {
            gameRoom: this.gameRoom,
            gameName: this.gameName,
            opponentUsername: this.opponentUsername,
            username: this.username,
        };

        if (this.gameFinished) {
            if (this.userDifferencesFound === this.differenceThreshold) {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, {
                    disableClose: true,
                    data: { gameFinished: true, gameWinner: true, videoReplay: this.videoReplay, time: this.timer },
                });
                this.playAreaService.startConfetti(undefined);
            } else {
                this.dialogRef = this.dialog.open(EndgameDialogComponent, {
                    disableClose: true,
                    data: { gameFinished: true, gameWinner: false, videoReplay: this.videoReplay },
                });
            }
            this.gameService.endGame(this.gameFinished, this.userDifferencesFound === this.differenceThreshold);
            this.unsubscribe();
        } else {
            this.abandonConfirmation();
        }
    }

    endGameLimitedTimeMode() {
        this.videoReplay.scoreboardParams = {
            gameRoom: this.gameRoom,
            gameName: this.gameName,
            opponentUsername: this.opponentUsername,
            username: this.username,
        };

        if (this.gameFinished) {
            this.gameService.endGame(this.gameFinished, this.userDifferencesFound === this.differenceThreshold);
            this.unsubscribe();
            this.dialogRef = this.dialog.open(EndgameDialogComponent, {
                disableClose: true,
                data: { gameFinished: true, gameWinner: true, limitedTimeMode: true },
            });
        } else {
            this.abandonConfirmation();
        }
    }

    toggleHint() {
        if (this.hintNum < 3) {
            this.playAreaService.hintMode(this.hintNum);
            if (this.gameService.gameMode === 'limited-time-mode') {
                this.gameService.changeTime(-this.gameService.gameConstants.penaltyTime);
            } else {
                this.gameService.changeTime(this.gameService.gameConstants.penaltyTime);
            }
            this.sendEvent('hint');
            this.hintNum += 1;
        }
    }

    sendEvent(event: string) {
        switch (event) {
            case 'error':
                this.gameService.sendMessage(`Erreur par ${this.username}`, 'Système');
                break;
            case 'success':
                this.gameService.sendMessage(`Différence trouvée par ${this.username}`, 'Système');
                break;
            case 'abandon':
                this.gameService.sendMessage(`${this.username} a abandonné la partie`, 'Système');
                break;
            case 'hint':
                this.gameService.sendMessage('Indice utilisé', 'Système');
                break;
        }
    }

    getImage(data: { src: string; first: boolean }) {
        if (data.first) {
            this.videoReplay.images.original = data.src;
        } else {
            this.videoReplay.images.modified = data.src;
        }
    }

    getDiff(data: { diff: number[][] }) {
        this.videoReplay.actions.push({ type: Instruction.DiffFound, timeStart: this.timer, difference: data.diff });
    }

    getError(data: { pos: Vec2; leftCanvas: boolean }) {
        this.videoReplay.actions.push({ type: Instruction.Error, timeStart: this.timer, mousePosition: data.pos, leftCanvas: data.leftCanvas });
    }

    getSource(data: { src: string; layer: HTMLCanvasElement }) {
        this.videoReplay.sources.push(data.src);
        this.videoReplay.cheatLayers.push(data.layer);
    }

    getCheatStart(data: { layer: HTMLCanvasElement }) {
        this.videoReplay.actions.push({ type: Instruction.CheatModeStart, timeStart: this.timer, cheatLayer: data.layer });
    }

    getCheatEnd() {
        this.videoReplay.actions.push({ type: Instruction.CheatModeEnd, timeStart: this.timer });
    }

    getChatMessage(data: Message) {
        this.videoReplay.actions.push({ type: Instruction.ChatMessage, timeStart: this.timer, message: data });
    }

    getDifferencesFound(data: number) {
        this.videoReplay.actions.push({ type: Instruction.Score, timeStart: this.timer, nbDifferences: data, username: this.username });
    }

    getOpponentDifferencesFound(data: number) {
        this.videoReplay.actions.push({ type: Instruction.Score, timeStart: this.timer, nbDifferences: data, username: this.opponentUsername });
    }

    getHint(data: { hintNum: number; diffPos: Vec2; layer: HTMLCanvasElement }) {
        this.videoReplay.actions.push({
            type: Instruction.Hint,
            timeStart: this.timer,
            mousePosition: data.diffPos,
            nbDifferences: data.hintNum,
            cheatLayer: data.layer,
        });
    }

    ngOnDestroy() {
        this.gameService.reset();
        this.dialog.closeAll();
        this.playAreaService.clearAsync();
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
                    }, Time.Thousand);
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
