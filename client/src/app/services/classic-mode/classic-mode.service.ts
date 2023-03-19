import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameRoom } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { ChatService } from '@app/services/chat/chat.service';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClassicModeService {
    gameRoom: GameRoom;
    username: string;
    userDifferencesFound = 0;
    totalDifferencesFound$ = new Subject<number>();
    userDifferencesFound$ = new Subject<number>();
    timer$ = new Subject<number>();
    gameFinished$ = new Subject<boolean>();
    gameRoom$ = new Subject<GameRoom>();
    serverValidateResponse$ = new Subject<DifferenceTry>();
    rejected$ = new Subject<boolean>();
    accepted$ = new Subject<boolean>();
    gameCanceled$ = new Subject<boolean>();
    abandoned$ = new Subject<string>();

    private canSendValidate = true;

    constructor(
        private readonly socketService: CommunicationSocketService,
        private communicationService: CommunicationHttpService,
        private chatService: ChatService,
    ) {}

    initClassicMode(gameName: string, username: string, started: boolean): void {
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
                };
                this.username = username;
                this.disconnectSocket();
                this.connect();
                this.socketService.send('createGame', this.gameRoom);
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    joinWaitingRoomClassicModeMulti(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (res && Object.keys(res).length !== 0) {
                this.gameRoom = undefined as unknown as GameRoom;
                this.username = username;
                this.disconnectSocket();
                this.connect();
                this.socketService.send('askingToJoinGame', { gameName, username });
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    playerRejected(player: string): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('rejectPlayer', { roomId: this.gameRoom.roomId, username: player });
        }
    }

    playerAccepted(player: string): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('acceptPlayer', { roomId: this.gameRoom.roomId, username: player });
        }
    }

    startGame(): void {
        if (this.gameRoom.userGame.username1 === this.username) {
            this.socketService.send('start', this.gameRoom.roomId);
        }
        this.chatService.handleMessage();
        this.socketService.off('gameInfo');
        this.socketService.off('gameCreated');
        this.socketService.off('playerAccepted');
        this.socketService.off('playerRejected');
        this.socketService.off('gameCanceled');
    }

    validateDifference(differencePos: Vec2) {
        if (!this.canSendValidate) {
            return;
        }
        this.socketService.send('validate', { differencePos, roomId: this.gameRoom.roomId, username: this.username });
        this.canSendValidate = false;
    }

    endGame(): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('endGame', { roomId: this.gameRoom.roomId, username: this.username });
        }
    }

    abandonGame() {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('abandoned', { roomId: this.gameRoom.roomId, username: this.username });
        }
    }

    abortGame(): void {
        if (this.socketService.isSocketAlive() && this.gameRoom?.userGame.username1 === this.username) {
            this.socketService.send('abortGameCreation', this.gameRoom.roomId);
        } else if (this.socketService.isSocketAlive() && this.gameRoom) {
            this.socketService.send('leaveGame', { roomId: this.gameRoom.roomId, username: this.username });
        }
        this.disconnectSocket();
    }

    disconnectSocket(): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.disconnect();
        }
    }

    connectSocket(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
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
        this.rejected$ = new Subject<boolean>();
        this.accepted$ = new Subject<boolean>();
        this.gameCanceled$ = new Subject<boolean>();
        this.abandoned$ = new Subject<string>();
    }

    private connect(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.handleSocket();
        } else {
            alert('Problème de connexion');
        }
    }

    private handleSocket(): void {
        this.socketService.on('gameInfo', (gameRoom: GameRoom) => {
            if (gameRoom && (!this.gameRoom || this.gameRoom.userGame.gameData.gameForm.name === gameRoom.userGame.gameData.gameForm.name)) {
                this.gameRoom = gameRoom;
                this.gameRoom$.next(this.gameRoom);
            } else if (!gameRoom) {
                alert('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
            }
        });

        this.socketService.on('gameCreated', (gameRoom: GameRoom) => {
            if (gameRoom) {
                this.gameRoom = gameRoom;
                this.gameRoom$.next(this.gameRoom);
                if (gameRoom.started) {
                    this.startGame();
                }
            } else if (!gameRoom) {
                alert('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
            }
        });

        this.socketService.on('started', () => {
            this.gameRoom$.next(this.gameRoom);
        });

        this.socketService.on('validated', (differenceTry: DifferenceTry) => {
            if (differenceTry.validated) {
                this.gameRoom.userGame.nbDifferenceFound++;
                this.totalDifferencesFound$.next(this.gameRoom.userGame.nbDifferenceFound);
                if (differenceTry.username === this.username) {
                    this.userDifferencesFound++;
                    this.userDifferencesFound$.next(this.userDifferencesFound);
                }
            }
            this.serverValidateResponse$.next(differenceTry);
        });

        this.socketService.on('GameFinished', () => {
            this.gameFinished$.next(true);
            this.disconnectSocket();
        });

        this.socketService.on('playerAccepted', (gameRoom: GameRoom) => {
            if (gameRoom && (gameRoom.userGame.username1 === this.username || gameRoom.userGame.username2 === this.username)) {
                this.gameRoom = gameRoom;
                this.accepted$.next(true);
            } else if (gameRoom) {
                this.gameRoom = gameRoom;
                this.rejected$.next(true);
            }
        });

        this.socketService.on('playerRejected', (gameRoom: GameRoom) => {
            if (
                gameRoom &&
                gameRoom.userGame.username1 !== this.username &&
                gameRoom.userGame.username2 !== this.username &&
                !gameRoom.userGame.potentielPlayers?.includes(this.username)
            ) {
                this.rejected$.next(true);
            } else if (gameRoom) {
                this.gameRoom = gameRoom;
            }
        });

        this.socketService.on('gameCanceled', (gameName) => {
            if (this.gameRoom?.userGame.gameData.gameForm.name === gameName) {
                this.gameCanceled$.next(true);
            }
        });

        this.socketService.on('abandoned', (userName: string) => {
            this.abandoned$.next(userName);
        });

        this.socketService.on('timer', (timer: number) => {
            this.gameRoom.userGame.timer = timer;
            this.timer$.next(timer);
            this.canSendValidate = true;
        });
    }
}
