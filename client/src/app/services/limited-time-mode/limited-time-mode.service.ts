import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { EndGame, GameData, GameRoom } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { GameService } from '@app/services/game/game.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LimitedTimeModeService {
    gameRoom: GameRoom;
    username: string;
    userDifferencesFound = 0;
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
    private slides: GameData[] = [];
    constructor(private communicationService: CommunicationHttpService) {
        this.getAllGames();
    }

    getAllGames() {
        this.communicationService.getAllGames().subscribe((games) => {
            for (const game of games) {
                this.communicationService.getGame(game.name).subscribe((res) => {
                    if (res) this.slides.push(res);
                });
            }
        });
    }

    setGameService(gameService: GameService) {
        this.gameService = gameService;
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

    nextGame(): void {
        if (this.slides.length > 0) {
            const game = this.slides.pop();
            this.gameRoom.userGame.gameData = game ? game : this.gameRoom.userGame.gameData;
            this.gameRoom$.next(this.gameRoom);
            this.gameService.socketService.send('nextGame', this.gameRoom);
        } else {
            this.gameFinished$.next(true);
        }
    }

    turnOffSocket(): void {
        this.gameService.socketService.off('gameInfo');
        this.gameService.socketService.off('gameCreated');
        this.gameService.socketService.off('validated');
        this.gameService.socketService.off('GameFinished');
        this.gameService.socketService.off('abandoned');
        this.gameService.socketService.off('started');
        this.gameService.socketService.off('timer');
    }
}
