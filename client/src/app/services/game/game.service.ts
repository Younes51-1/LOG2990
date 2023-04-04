import { Injectable } from '@angular/core';
import { GameContext, GameRoom } from '@app/interfaces/game';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Subject } from 'rxjs';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { ChatService } from '@app/services/chat/chat.service';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { Vec2 } from '@app/interfaces/vec2';

const NOT_TOP3 = -1;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    gameExists$ = new Subject<boolean>();
    rejected$ = new Subject<boolean>();
    accepted$ = new Subject<boolean>();
    gameCanceled$ = new Subject<boolean>();
    timePosition$ = new Subject<number>();
    serverValidateResponse$ = new Subject<DifferenceTry>();
    totalDifferencesFound$ = new Subject<number>();
    userDifferencesFound$ = new Subject<number>();
    timer$ = new Subject<number>();
    gameFinished$ = new Subject<boolean>();
    gameRoom$ = new Subject<GameRoom>();
    gameDeleted$ = new Subject<boolean>();
    abandoned$ = new Subject<string>();
    gameRoom: GameRoom;
    username: string;
    gameMode: string;
    private gameManager: ClassicModeService;

    constructor(
        readonly socketService: CommunicationSocketService,
        private classicModeService: ClassicModeService,
        private chatService: ChatService,
    ) {}

    setGameMode(mode: string) {
        this.gameMode = mode;
        this.setGameManager();
        this.timerUpdate();
        this.differencesUpdate();
        this.gameFinishedUpdate();
        this.gameRoomUpdate();
        this.abandonedGameUpdate();
    }

    setGameManager() {
        if (this.gameMode === 'classic-mode') {
            this.gameManager = this.classicModeService;
            this.classicModeService.setGameService(this);
        }
    }

    getGameMode() {
        return this.gameMode;
    }

    connectSocket(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }

    disconnectSocket(): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.disconnect();
        }
    }

    checkGame(gameName: string): void {
        this.connectSocket();
        this.socketService.send('checkGame', { gameName, gameMode: this.gameMode });
        this.socketService.on('gameFound', (gameContext: GameContext) => {
            if (gameName === gameContext.gameName && this.gameMode === gameContext.gameMode) {
                this.gameExists$.next(true);
            }
        });

        this.socketService.on('gameDeleted', (gameContext: GameContext) => {
            if (gameName === gameContext.gameName && this.gameMode === gameContext.gameMode) {
                this.gameExists$.next(false);
            }
        });
    }

    startSoloGame(gameName: string, username: string): void {
        this.username = username;
        this.gameManager.initGameMode(gameName, username, true);
    }

    createGame(gameName: string, username: string): void {
        this.username = username;
        this.gameManager.initGameMode(gameName, username, false);
        this.handleWaitingRoomSocket();
    }

    joinGame(gameName: string, username: string): void {
        this.username = username;
        this.gameManager.joinWaitingRoom(gameName, username);
        this.handleWaitingRoomSocket();
    }

    canJoinGame(gameName: string, username: string, gameCard: GameCardComponent): void {
        this.socketService.send('canJoinGame', { gameName, username, gameMode: this.gameMode });
        this.socketService.on('cannotJoinGame', () => {
            gameCard.applyBorder = true;
            this.disconnectSocket();
        });
        this.socketService.on('canJoinGame', () => {
            gameCard.joinGame();
        });
    }
    playerRejected(player: string): void {
        this.gameManager.playerRejected(player);
    }

    playerAccepted(player: string): void {
        this.gameManager.playerAccepted(player);
    }

    startGame(): void {
        this.gameManager.startGame();
        this.chatService.handleMessage();
    }

    abortGame(): void {
        this.gameManager.abortGame();
    }

    handleWaitingRoomSocket(): void {
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
                !gameRoom.userGame.potentialPlayers?.includes(this.username)
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
    }

    topScore() {
        this.gameManager.timePosition$.subscribe((timePosition: number) => {
            if (timePosition === NOT_TOP3) return;
            this.timePosition$.next(timePosition);
        });
    }

    sendServerValidate(mousePosition: Vec2): void {
        this.gameManager.validateDifference(mousePosition);
    }

    timerUpdate(): void {
        this.gameManager.timer$.subscribe((timer) => {
            this.timer$.next(timer);
        });
    }

    differencesUpdate(): void {
        this.gameManager.totalDifferencesFound$.subscribe((totalDifferencesFound) => {
            this.totalDifferencesFound$.next(totalDifferencesFound);
        });
        this.gameManager.userDifferencesFound$.subscribe((userDifferencesFound) => {
            this.userDifferencesFound$.next(userDifferencesFound);
        });
    }

    gameFinishedUpdate(): void {
        this.gameManager.gameFinished$.subscribe((gameFinished) => {
            this.gameFinished$.next(gameFinished);
        });
    }

    gameRoomUpdate(): void {
        this.gameManager.gameRoom$.subscribe((gameRoom) => {
            this.gameRoom$.next(gameRoom);
            this.gameRoom = gameRoom;
        });
    }

    abandonedGameUpdate(): void {
        this.gameManager.abandoned$.subscribe((abandoned) => {
            this.abandoned$.next(abandoned);
        });
    }

    endGame(gameFinished: boolean, winner: boolean): void {
        this.gameManager.endGame(gameFinished, winner);
    }

    changeTime(number: number): void {
        this.gameManager.changeTime(number);
    }

    reset(): void {
        this.gameManager.reset();
    }

    abandonGame(): void {
        this.gameManager.abandonGame();
    }
}
