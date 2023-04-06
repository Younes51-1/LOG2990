import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { EndGame, GameRoom, NewBestTime } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { Subject } from 'rxjs';
import { GameService } from '@app/services/game/game.service';

@Injectable({
    providedIn: 'root',
})
export class ClassicModeService {
    gameRoom: GameRoom;
    username: string;
    userDifferencesFound = 0;
    isAbandoned = false;
    totalDifferencesFound$ = new Subject<number>();
    userDifferencesFound$ = new Subject<number>();
    timer$ = new Subject<number>();
    gameFinished$ = new Subject<boolean>();
    gameRoom$ = new Subject<GameRoom>();
    serverValidateResponse$ = new Subject<DifferenceTry>();
    gameDeleted$ = new Subject<boolean>();
    abandoned$ = new Subject<string>();
    timePosition$ = new Subject<number>();
    private gameService: GameService;
    private canSendValidate = true;

    constructor(private communicationService: CommunicationHttpService, private configHttpService: ConfigHttpService) {}

    setGameService(gameService: GameService) {
        this.gameService = gameService;
        if (!this.gameRoom && this.gameService.gameRoom) {
            this.gameRoom = this.gameService.gameRoom;
            this.handleSocket();
        }
    }

    initGameMode(gameName: string, username: string, started: boolean): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (res && Object.keys(res).length !== 0) {
                this.gameRoom = {
                    userGame: {
                        gameData: res,
                        nbDifferenceFound: 0,
                        timer: 0,
                        username1: username,
                    },
                    roomId: '',
                    started,
                    gameMode: 'classic-mode',
                };
                this.username = username;
                this.gameService.disconnectSocket();
                this.connect();
                if (!started) this.gameService.handleWaitingRoomSocket();
                this.gameService.socketService.send('createGame', this.gameRoom);
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    joinWaitingRoom(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (res && Object.keys(res).length !== 0) {
                this.gameRoom = undefined as unknown as GameRoom;
                this.username = username;
                this.gameService.disconnectSocket();
                this.connect();
                this.gameService.handleWaitingRoomSocket();
                this.gameService.socketService.send('askingToJoinGame', { gameName, username, gameMode: 'classic-mode' });
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    startGame(): void {
        if (this.gameRoom.userGame.username1 === this.username) {
            this.gameService.socketService.send('start', this.gameRoom.roomId);
        }
        this.gameService.socketService.off('gameInfo');
        this.gameService.socketService.off('gameCreated');
        this.gameService.socketService.off('playerAccepted');
        this.gameService.socketService.off('playerRejected');
        this.gameService.socketService.off('gameCanceled');
    }

    validateDifference(differencePos: Vec2) {
        if (!this.canSendValidate) {
            return;
        }
        this.gameService.socketService.send('validate', { differencePos, roomId: this.gameRoom.roomId, username: this.username });
        this.canSendValidate = false;
    }

    endGame(gameFinished: boolean, winner: boolean): void {
        if (this.gameService.socketService.isSocketAlive()) {
            const endGame = {} as EndGame;
            endGame.gameFinished = gameFinished;
            endGame.winner = winner;
            endGame.roomId = this.gameRoom.roomId;
            endGame.username = this.username;
            this.gameService.socketService.send('endGame', endGame);
            this.updateBestTime(gameFinished, winner);
        }
    }

    abandonGame() {
        if (this.gameService.socketService.isSocketAlive()) {
            this.gameService.socketService.send('abandoned', { roomId: this.gameRoom.roomId, username: this.username });
        }
    }

    abortGame(): void {
        if (this.gameService.socketService.isSocketAlive() && this.gameRoom?.userGame.username1 === this.username) {
            this.gameService.socketService.send('abortGameCreation', this.gameRoom.roomId);
        } else if (this.gameService.socketService.isSocketAlive() && this.gameRoom) {
            this.gameService.socketService.send('leaveGame', { roomId: this.gameRoom.roomId, username: this.username });
        }
        this.gameService.disconnectSocket();
    }

    reset() {
        this.gameRoom = undefined as unknown as GameRoom;
        this.canSendValidate = true;
        this.username = '';
        this.userDifferencesFound = 0;
        this.totalDifferencesFound$ = new Subject<number>();
        this.userDifferencesFound$ = new Subject<number>();
        this.timer$ = new Subject<number>();
        this.gameFinished$ = new Subject<boolean>();
        this.gameRoom$ = new Subject<GameRoom>();
        this.serverValidateResponse$ = new Subject<DifferenceTry>();
        this.abandoned$ = new Subject<string>();
    }

    changeTime(timeToApply: number): void {
        if (this.gameService.socketService.isSocketAlive()) {
            this.gameService.socketService.send('changeTime', { roomId: this.gameRoom.roomId, time: timeToApply });
        }
    }

    private connect(): void {
        if (!this.gameService.socketService.isSocketAlive()) {
            this.gameService.socketService.connect();
            this.handleSocket();
        } else {
            alert('Problème de connexion');
        }
    }

    private handleSocket(): void {
        this.gameService.socketService.on('gameInfo', (gameRoom: GameRoom) => {
            if (
                gameRoom &&
                (!this.gameRoom || this.gameRoom.userGame.gameData.gameForm.name === gameRoom.userGame.gameData.gameForm.name) &&
                this.gameService.gameMode === gameRoom.gameMode
            ) {
                this.gameRoom = gameRoom;
                this.gameRoom$.next(this.gameRoom);
            } else if (!gameRoom) {
                alert('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
            }
        });

        this.gameService.socketService.on('gameCreated', (gameRoom: GameRoom) => {
            if (gameRoom && gameRoom.gameMode === this.gameService.gameMode) {
                this.gameRoom = gameRoom;
                this.gameRoom$.next(this.gameRoom);
                if (gameRoom.started) {
                    this.gameService.startGame();
                }
            } else if (!gameRoom) {
                alert('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
            }
        });

        this.gameService.socketService.on('started', (gameRoom: GameRoom) => {
            this.gameRoom = gameRoom;
            this.gameRoom$.next(gameRoom);
        });

        this.gameService.socketService.on('validated', (differenceTry: DifferenceTry) => {
            if (differenceTry.validated) {
                this.gameRoom.userGame.nbDifferenceFound++;
                this.totalDifferencesFound$.next(this.gameRoom.userGame.nbDifferenceFound);
                if (differenceTry.username === this.username) {
                    this.userDifferencesFound++;
                    this.userDifferencesFound$.next(this.userDifferencesFound);
                }
            }
            this.gameService.serverValidateResponse$.next(differenceTry);
        });

        this.gameService.socketService.on('GameFinished', () => {
            this.gameFinished$.next(true);
            this.gameService.disconnectSocket();
        });

        this.gameService.socketService.on('abandoned', (userName: string) => {
            this.isAbandoned = true;
            this.abandoned$.next(userName);
        });

        this.gameService.socketService.on('timer', (timer: number) => {
            this.gameRoom.userGame.timer = timer;
            this.timer$.next(timer);
            this.canSendValidate = true;
        });
    }

    private updateBestTime(gameFinished: boolean, winner: boolean): void {
        this.configHttpService.getBestTime(this.gameRoom.userGame.gameData.gameForm.name).subscribe((bestTimes) => {
            if (!bestTimes) return;
            const actualBestTime = this.gameRoom.userGame.username2 ? bestTimes.vsBestTimes[2].time : bestTimes.soloBestTimes[2].time;
            if (this.gameRoom.userGame.timer < actualBestTime && winner && gameFinished && !this.isAbandoned) {
                const newBestTime = new NewBestTime();
                newBestTime.gameName = this.gameRoom.userGame.gameData.gameForm.name;
                newBestTime.time = this.gameRoom.userGame.timer;
                newBestTime.name = this.username;
                newBestTime.isSolo = !this.gameRoom.userGame.username2;
                this.configHttpService.updateBestTime(this.gameRoom.userGame.gameData.gameForm.name, newBestTime).subscribe((position) => {
                    this.timePosition$.next(position);
                });
            }
        });
    }
}
