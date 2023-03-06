import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameRoom } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { Subject } from 'rxjs';
import { ChatService } from '@app/services/chatService/chat.service';

@Injectable({
    providedIn: 'root',
})
export class ClassicModeService {
    gameRoom: GameRoom;
    canSendValidate = true;
    userName: string;
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
    abandoned$ = new Subject<boolean>();

    constructor(
        private readonly socketService: CommunicationSocketService,
        private communicationService: CommunicationService,
        private chatService: ChatService,
    ) {}

    initClassicMode(gameName: string, username: string, started: boolean): void {
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
                    started,
                };
                this.userName = username;
                this.connect();
                this.socketService.send('createGame', this.gameRoom);
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    joinGameClassicModeSolo(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.gameRoom = undefined as unknown as GameRoom;
                this.userName = username;
                this.connect();
                this.socketService.send('joinGame', [gameName, username]);
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    joinWaitingRoomClassicModeMulti(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.gameRoom = undefined as unknown as GameRoom;
                this.userName = username;
                this.connect();
                this.socketService.send('askingToJoinGame', [gameName, username]);
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    playerRejected(player: string): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('rejectPlayer', [this.gameRoom.roomId, player]);
        }
    }

    playerAccepted(player: string): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('acceptPlayer', [this.gameRoom.roomId, player]);
        }
    }

    connect(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.handleSocket();
        } else {
            alert('Problème de connexion');
        }
    }

    handleSocket(): void {
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
                if (differenceTry.username === this.userName) {
                    this.userDifferencesFound++;
                    this.userDifferencesFound$.next(this.userDifferencesFound);
                }
            }
            this.serverValidateResponse$.next(differenceTry);
        });

        // TODO: Remove disable lint and use userName for dialog
        // eslint-disable-next-line no-unused-vars
        this.socketService.on('GameFinished', (userName: string) => {
            this.gameFinished$.next(true);
            this.socketService.disconnect();
        });

        this.socketService.on('playerAccepted', (gameRoom: GameRoom) => {
            if (gameRoom && (gameRoom.userGame.username1 === this.userName || gameRoom.userGame.username2 === this.userName)) {
                this.gameRoom = gameRoom;
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
            }
        });

        this.socketService.on('gameCanceled', (gameName) => {
            if (this.gameRoom?.userGame.gameData.gameForm.name === gameName) {
                this.gameCanceled$.next(true);
            }
        });

        this.socketService.on('abandoned', () => {
            this.abandoned$.next(true);
        });

        this.socketService.on('timer', (timer: number) => {
            this.gameRoom.userGame.timer = timer;
            this.timer$.next(timer);
            this.canSendValidate = true;
        });
    }

    startGame(): void {
        if (this.gameRoom.userGame.username1 === this.userName) {
            this.socketService.send('start', this.gameRoom.roomId);
        }
        this.chatService.handleSocket();
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
        this.socketService.send('validate', [differencePos, this.gameRoom.roomId, this.userName]);
        this.canSendValidate = false;
    }

    endGame(): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('endGame', [this.gameRoom.roomId, this.userName]);
        }
    }

    abondonGame() {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('abondonGame', this.gameRoom.roomId);
        }
    }

    abortGame(): void {
        if (this.socketService.isSocketAlive() && this.gameRoom?.userGame.username1 === this.userName) {
            this.socketService.send('abortGameCreation', this.gameRoom.roomId);
        } else if (this.socketService.isSocketAlive()) {
            this.socketService.send('leaveGame', [this.gameRoom.roomId, this.userName]);
        }
        this.socketService.disconnect();
    }
}
