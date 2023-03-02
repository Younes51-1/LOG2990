import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameRoom, UserGame } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClassicModeService {
    gameRoom: GameRoom;
    canSendValidate = true;
    userName: string;
    differencesFound$ = new Subject<number>();
    timer$ = new Subject<number>();
    gameFinished$ = new Subject<boolean>();
    userGame$ = new Subject<UserGame>();
    serverValidateResponse$ = new Subject<boolean>();
    rejected$ = new Subject<boolean>();
    accepted$ = new Subject<boolean>();
    gameCanceled$ = new Subject<boolean>();

    constructor(private readonly socketService: CommunicationSocketService, private communicationService: CommunicationService) {}

    initClassicModeSolo(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.gameRoom = {
                    userGame: {
                        gameData: res,
                        nbDifferenceFound: 0,
                        timer: 0,
                        username1: username,
                    },
                    roomId: '',
                    started: true,
                };
                this.userName = username;
                this.userGame$.next(this.gameRoom.userGame);
                this.connect();
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    createClassicModeMulti(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.gameRoom = {
                    userGame: {
                        gameData: res,
                        nbDifferenceFound: 0,
                        timer: 0,
                        username1: username,
                    },
                    roomId: '',
                    started: false,
                };
                this.userName = username;
                this.userGame$.next(this.gameRoom.userGame);
                this.connect();
                this.socketService.send('createGame', this.gameRoom.userGame);
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    joinClassicModeMulti(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.userName = username;
                this.connect();
                this.socketService.send('joinGame', [gameName, username]);
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    playerRejected(player: string): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('rejectPlayer', [this.gameRoom.userGame.gameData.gameForm.name, player]);
        }
    }

    playerAccepted(player: string): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('acceptPlayer', [this.gameRoom.userGame.gameData.gameForm.name, player]);
        }
    }

    connect(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.handleSocket();
        } else {
            alert('Problème de connexion Socket Alive');
        }
    }

    handleSocket(): void {
        this.socketService.on('waiting', () => {
            if (this.gameRoom?.started) {
                this.startGame();
            }
        });

        this.socketService.on('gameInfo', (gameRoom: GameRoom) => {
            if (gameRoom && (!this.gameRoom || this.gameRoom.userGame.gameData.gameForm.name === gameRoom.userGame.gameData.gameForm.name)) {
                this.gameRoom = gameRoom;
                this.userGame$.next(gameRoom.userGame);
            } else if (!gameRoom) {
                alert('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
            }
        });

        this.socketService.on('started', (roomId: string) => {
            this.gameRoom.roomId = roomId;
        });

        this.socketService.on('validated', (differenceTry: DifferenceTry) => {
            if (differenceTry.validated) {
                this.gameRoom.userGame.nbDifferenceFound++;
                this.differencesFound$.next(this.gameRoom.userGame.nbDifferenceFound);
            }
            this.serverValidateResponse$.next(differenceTry.validated);
        });

        this.socketService.on('GameFinished', (timer: number) => {
            this.gameRoom.userGame.timer = timer;
            this.gameFinished$.next(true);
            this.socketService.disconnect();
        });

        this.socketService.on('playerAccepted', (gameRoom: GameRoom) => {
            if (gameRoom && gameRoom.userGame.username1 === this.userName) {
                this.gameRoom = gameRoom;
                this.userGame$.next(gameRoom.userGame);
                this.accepted$.next(true);
            } else if (gameRoom && gameRoom.userGame.username2 === this.userName) {
                this.gameRoom = gameRoom;
                this.userGame$.next(gameRoom.userGame);
                this.accepted$.next(true);
            }
        });

        this.socketService.on('playerRejected', (gameRoom: GameRoom) => {
            if (
                gameRoom &&
                gameRoom.userGame.username1 !== this.userName &&
                gameRoom.userGame.username2 !== this.userName &&
                !gameRoom.userGame.potentielPlayers?.includes(this.userName)
            ) {
                this.rejected$.next(true);
            } else if (gameRoom) {
                this.gameRoom = gameRoom;
                this.userGame$.next(gameRoom.userGame);
            }
        });

        this.socketService.on('gameCanceled', (gameName) => {
            if (this.gameRoom?.userGame.gameData.gameForm.name === gameName) {
                this.gameCanceled$.next(true);
            }
        });

        this.socketService.on('timer', (timer: number) => {
            this.gameRoom.userGame.timer = timer;
            this.timer$.next(timer);
            this.canSendValidate = true;
        });
    }

    startGame(): void {
        this.socketService.send('start', this.gameRoom.userGame);
    }

    validateDifference(differencePos: Vec2) {
        if (!this.canSendValidate) {
            return;
        }
        this.socketService.send('validate', differencePos);
        this.canSendValidate = false;
    }

    endGame(): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('endGame');
        }
    }

    abortGame(): void {
        if (this.socketService.isSocketAlive() && this.gameRoom?.userGame.username1 === this.userName) {
            this.socketService.send('abortGameCreation', this.gameRoom.userGame.gameData.gameForm.name);
            this.socketService.disconnect();
        } else if (this.socketService.isSocketAlive()) {
            this.socketService.send('leaveGame', [this.gameRoom.userGame.gameData.gameForm.name, this.userName]);
            this.socketService.disconnect();
        }
    }
}
