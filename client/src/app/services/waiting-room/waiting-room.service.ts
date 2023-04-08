import { Injectable } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomService {
    rejected$ = new Subject<boolean>();
    accepted$ = new Subject<boolean>();
    gameCanceled$ = new Subject<boolean>();
    gameRoom: GameRoom;
    username: string;
    gameMode: string;
    constructor(private router: Router, private readonly socketService: CommunicationSocketService) {}

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

    abortGame(): void {
        if (this.socketService.isSocketAlive() && this.gameRoom?.userGame.username1 === this.username) {
            this.socketService.send('abortGameCreation', this.gameRoom.roomId);
        } else if (this.socketService.isSocketAlive() && this.gameRoom) {
            this.socketService.send('leaveGame', { roomId: this.gameRoom.roomId, username: this.username });
        }
        this.disconnectSocket();
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/selection']);
        });
    }

    startGame(): void {
        if (this.gameRoom.userGame.username1 === this.username) {
            this.socketService.send('start', this.gameRoom.roomId);
        }
        this.socketService.off('gameInfo');
        this.socketService.off('gameCreated');
        this.socketService.off('playerAccepted');
        this.socketService.off('playerRejected');
        this.socketService.off('gameCanceled');
        this.router.navigate(['/game']);
    }

    createGame(gameRoom: GameRoom): void {
        this.gameRoom = gameRoom;
        this.username = this.gameRoom.userGame.username1;
        this.disconnectSocket();
        this.connectSocket();
        this.handleWaitingRoomSocket();
        this.socketService.send('createGame', this.gameRoom);
    }

    joinGame(gameName: string, username: string): void {
        this.gameRoom = undefined as unknown as GameRoom;
        this.username = username;
        this.disconnectSocket();
        this.connectSocket();
        this.handleWaitingRoomSocket();
        this.socketService.send('askingToJoinGame', { gameName, username, gameMode: 'classic-mode' });
    }

    handleWaitingRoomSocket(): void {
        this.socketService.on('gameInfo', (gameRoom: GameRoom) => {
            if (
                gameRoom &&
                (!this.gameRoom || this.gameRoom.userGame.gameData.name === gameRoom.userGame.gameData.name) &&
                this.gameMode === gameRoom.gameMode
            ) {
                this.gameRoom = gameRoom;
            } else if (!gameRoom) {
                alert('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
            }
        });

        this.socketService.on('gameCreated', (gameRoom: GameRoom) => {
            if (gameRoom && gameRoom.gameMode === this.gameMode) {
                this.gameRoom = gameRoom;
                if (gameRoom.started) {
                    this.startGame();
                }
            } else if (!gameRoom) {
                alert('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
            }
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
                !gameRoom.userGame.potentialPlayers?.includes(this.username)
            ) {
                this.rejected$.next(true);
            } else if (gameRoom) {
                this.gameRoom = gameRoom;
            }
        });

        this.socketService.on('gameCanceled', (gameName) => {
            if (this.gameRoom?.userGame.gameData.name === gameName) {
                this.gameCanceled$.next(true);
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
}
