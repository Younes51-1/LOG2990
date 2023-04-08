import { Injectable } from '@angular/core';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameContext } from '@app/interfaces/game';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameFinderService {
    gameExists$ = new Subject<boolean>();
    gameMode: string;
    constructor(private readonly socketService: CommunicationSocketService) {}

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
}
