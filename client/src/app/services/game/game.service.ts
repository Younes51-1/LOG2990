import { Injectable } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Subject } from 'rxjs';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ChatService } from '@app/services/chat/chat.service';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { Vec2 } from '@app/interfaces/vec2';
import { LimitedTimeModeService } from '@app/services/limited-time-mode/limited-time-mode.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { GameConstants } from '@app/interfaces/game-constants';

const NOT_TOP3 = -1;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    gameExists$ = new Subject<boolean>();
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
    gameManager: ClassicModeService | LimitedTimeModeService;
    gameConstans: GameConstants;

    // eslint-disable-next-line max-params
    constructor(
        readonly socketService: CommunicationSocketService,
        private classicModeService: ClassicModeService,
        private limitedTimeModeService: LimitedTimeModeService,
        private chatService: ChatService,
        readonly configHttpService: ConfigHttpService,
    ) {
        this.configHttpService.getConstants().subscribe((res) => {
            this.gameConstans = res;
        });
        if (!this.gameMode) {
            const gameMode = localStorage.getItem('gameMode');
            if (gameMode) {
                this.setGameMode(gameMode);
            }
        }
    }

    setGameMode(mode: string) {
        localStorage.setItem('gameMode', mode);
        this.setGameManager();
        this.timerUpdate();
        this.differencesUpdate();
        this.gameFinishedUpdate();
        this.gameRoomUpdate();
        this.abandonedGameUpdate();
    }

    setGameManager() {
        const gameMode = localStorage.getItem('gameMode');
        if (gameMode) {
            this.gameMode = gameMode;
        }
        if (this.gameMode === 'classic-mode') {
            this.gameManager = this.classicModeService;
            this.classicModeService.setGameService(this);
        } else {
            this.gameManager = this.limitedTimeModeService;
            this.limitedTimeModeService.setGameService(this);
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

    startGame(): void {
        this.gameManager.startGame();
        this.chatService.handleMessage();
    }

    abortGame(): void {
        this.gameManager.abortGame();
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

    nextGame(): void {
        if (this.gameManager instanceof LimitedTimeModeService) {
            this.gameManager.nextGame();
        }
    }

    limitedTimeGameAbandoned() {
        this.gameRoom = this.gameManager.gameRoom;
        this.gameManager.turnOffSocket();
        this.setGameMode(this.gameRoom.gameMode);
        this.gameRoom$.next(this.gameRoom);
    }
}
