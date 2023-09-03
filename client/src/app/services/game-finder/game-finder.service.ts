import { Injectable } from '@angular/core';
import { CreateJoinGameDialogComponent } from '@app/components/create-join-game-dialog/create-join-game-dialog.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameContext } from '@app/interfaces/game';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Subject } from 'rxjs';
import { GameMode } from '@common/game-mode';

@Injectable({
    providedIn: 'root',
})
export class GameFinderService {
    gameExists$ = new Subject<boolean>();
    gameMode: string;
    constructor(private readonly socketService: CommunicationSocketService) {}

    checkGame(gameName = undefined as unknown as string): void {
        this.connectSocket();
        this.socketService.send('checkGame', { gameName, gameMode: this.gameMode });
        this.socketService.on('gameFound', (gameContext: GameContext) => {
            if (gameContext.gameMode === GameMode.limitedTimeMode && gameContext.gameMode === this.gameMode) {
                this.gameExists$.next(true);
            } else if (gameName === gameContext.gameName && gameContext.gameMode === this.gameMode) {
                this.gameExists$.next(true);
            }
        });

        this.socketService.on('gameDeleted', (gameContext: GameContext) => {
            if (gameContext.gameMode === GameMode.limitedTimeMode && gameContext.gameMode === this.gameMode) {
                this.gameExists$.next(false);
            } else if (gameName === gameContext.gameName && gameContext.gameMode === this.gameMode) {
                this.gameExists$.next(false);
            }
        });
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

    canJoinGame(username: string, gameCard: GameCardComponent | CreateJoinGameDialogComponent, gameName = undefined as unknown as string): void {
        this.socketService.send('canJoinGame', { gameName, username, gameMode: this.gameMode });
        this.socketService.on('cannotJoinGame', () => {
            gameCard.applyBorder = true;
            this.disconnectSocket();
        });
        this.socketService.on('canJoinGame', () => {
            gameCard.joinGame();
        });
    }
}
