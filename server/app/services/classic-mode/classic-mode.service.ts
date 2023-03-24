import { EMPTY_PIXEL_VALUE } from '@app/constants';
import { GameHistory } from '@app/model/database/game-history';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ClassicModeService {
    private gameRooms: Map<string, GameRoom> = new Map<string, GameRoom>();
    private gameHistory: Map<string, GameHistory> = new Map<string, GameHistory>();

    initNewRoom(socket: Socket, userGame: UserGame, started: boolean): GameRoom {
        const newRoom = { userGame, roomId: socket.id, started };
        this.gameRooms.set(newRoom.roomId, newRoom);
        socket.join(newRoom.roomId);
        return newRoom;
    }

    canJoinGame(socket: Socket, gameName: string, userName: string): GameRoom {
        const gameRoom = this.getGameRoom(gameName);
        if (!gameRoom) return undefined;
        if (!gameRoom.userGame.potentialPlayers) {
            gameRoom.userGame.potentialPlayers = [];
        }
        if (gameRoom.userGame.username1.toLowerCase() === userName.toLowerCase()) {
            return undefined;
        }
        if (gameRoom.userGame.potentialPlayers.some((player) => player.toLowerCase() === userName.toLowerCase())) {
            return undefined;
        }
        return gameRoom;
    }

    joinGame(socket: Socket, gameName: string, userName: string): boolean {
        const gameRoom = this.getGameRoom(gameName);
        if (!gameName) return false;
        gameRoom.userGame.potentialPlayers.push(userName);
        this.setRoom(gameRoom);
        socket.join(gameRoom.roomId);
        return true;
    }

    validateDifference(gameId: string, differencePos: Vector2D): boolean {
        const gameRoom = this.getRoom(gameId);
        if (!gameRoom) return false;
        const validated = gameRoom.userGame.gameData.differenceMatrix[differencePos.y][differencePos.x] !== EMPTY_PIXEL_VALUE;
        if (validated) {
            gameRoom.userGame.nbDifferenceFound++;
            this.setRoom(gameRoom);
        }
        return validated;
    }

    isGameFinished(gameId: string): boolean {
        const gameRoom = this.getRoom(gameId);
        return gameRoom.userGame.nbDifferenceFound === gameRoom.userGame.gameData.gameForm.nbDifference;
    }

    updateTimer(gameRoom: GameRoom): void {
        gameRoom.userGame.timer++;
        this.setRoom(gameRoom);
    }

    getRoom(roomId: string): GameRoom {
        return this.gameRooms.get(roomId);
    }

    setRoom(gameRoom: GameRoom): void {
        this.gameRooms.set(gameRoom.roomId, gameRoom);
    }

    getGameHistory(roomId: string): GameHistory {
        return this.gameHistory.get(roomId);
    }

    deleteRoom(roomId: string): void {
        this.gameRooms.delete(roomId);
    }

    getRoomsValues(): GameRoom[] {
        return Array.from(this.gameRooms.values());
    }

    getGameRoom(gameName: string): GameRoom {
        for (const gameRoom of this.getRoomsValues()) {
            if (!gameRoom.started && gameRoom.userGame.gameData.gameForm.name.toLocaleLowerCase() === gameName.toLocaleLowerCase()) {
                return gameRoom;
            }
        }
        return undefined;
    }

    saveGameHistory(gameRoom: GameRoom): void {
        const newGameHistory = new GameHistory();
        newGameHistory.name = gameRoom.userGame.gameData.gameForm.name;
        newGameHistory.username1 = gameRoom.userGame.username1;
        newGameHistory.username2 = gameRoom.userGame?.username2;
        newGameHistory.startTime = new Date().getTime();
        if (gameRoom.userGame.username2) {
            newGameHistory.gameMode = 'Mode classique Multi-joueur';
        } else {
            newGameHistory.gameMode = 'Mode classique Solo';
        }

        this.gameHistory.set(gameRoom.roomId, newGameHistory);
    }

    updateGameHistory(endGame: EndGame): void {
        const gameHistory = this.gameHistory.get(endGame.roomId);
        gameHistory.endTime = new Date().getTime() - gameHistory.startTime;
        if (endGame.gameFinished) {
            if (endGame.winner) {
                gameHistory.winner = endGame.username;
            } else if (!gameHistory.username2) {
                gameHistory.winner = 'Aucun gagnant';
            }
        } else {
            gameHistory.abandonned = endGame.username;
        }
        this.gameHistory.set(endGame.roomId, gameHistory);
    }

    abandonGameHistory(roomId: string, username: string): void {
        const gameHistory = this.gameHistory.get(roomId);
        if (gameHistory.username2) {
            gameHistory.abandonned = username;
        } else {
            this.updateGameHistory({ roomId, gameFinished: false, winner: false, username, timer: 0 });
        }
        this.gameHistory.set(roomId, gameHistory);
    }
}
