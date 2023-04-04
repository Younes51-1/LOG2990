import { GameHistory } from '@app/model/database/game-history';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { EndGame } from '@app/model/schema/end-game.schema';
import { EMPTY_PIXEL_VALUE } from '@app/constants';

@Injectable()
export class GameModeService {
    gameRooms: Map<string, GameRoom> = new Map<string, GameRoom>();
    private gameHistory: Map<string, GameHistory> = new Map<string, GameHistory>();

    constructor(private classicModeService: ClassicModeService) {
        this.classicModeService.setGameModeService(this);
    }

    getGameRoom(roomId?: string, gameName?: string, gameMode?: string): GameRoom {
        if (roomId) return this.gameRooms.get(roomId);
        for (const gameRoom of this.gameRooms.values()) {
            if (gameRoom.userGame.gameData.gameForm.name === gameName && gameRoom.gameMode === gameMode) return gameRoom;
        }
    }

    setGameRoom(gameRoom: GameRoom): void {
        this.gameRooms.set(gameRoom.roomId, gameRoom);
    }

    getGameHistory(roomId: string): GameHistory {
        return this.gameHistory.get(roomId);
    }

    setGameHistory(roomId: string, gameHistory: GameHistory): void {
        this.gameHistory.set(roomId, gameHistory);
    }

    deleteRoom(roomId: string): void {
        this.gameRooms.delete(roomId);
    }

    joinGame(socket: Socket, gameName: string, username: string): boolean {
        const gameRoom = this.getGameRoom(gameName);
        if (!gameRoom) return false;
        if (gameRoom.gameMode === 'classic-mode') {
            return this.classicModeService.joinGame(socket, gameRoom, username);
        }
    }

    saveGameHistory(gameRoom: GameRoom): void {
        const newGameHistory = new GameHistory();
        newGameHistory.name = gameRoom.userGame.gameData.gameForm.name;
        newGameHistory.username1 = gameRoom.userGame.username1;
        newGameHistory.username2 = gameRoom.userGame?.username2;
        newGameHistory.startTime = Date.now();
        newGameHistory.timer = 0;
        if (gameRoom.gameMode === 'classic-mode') {
            if (gameRoom.userGame.username2) {
                newGameHistory.gameMode = 'Mode classique Multi-joueur';
            } else {
                newGameHistory.gameMode = 'Mode classique Solo';
            }
        }

        this.setGameHistory(gameRoom.roomId, newGameHistory);
    }

    validateDifference(gameId: string, differencePos: Vector2D): boolean {
        const gameRoom = this.getGameRoom(gameId);
        if (!gameRoom) return false;
        const validated = gameRoom.userGame.gameData.differenceMatrix[differencePos.y][differencePos.x] !== EMPTY_PIXEL_VALUE;
        if (validated) {
            gameRoom.userGame.nbDifferenceFound++;
            this.setGameRoom(gameRoom);
        }
        return validated;
    }

    isGameFinished(gameId: string): boolean {
        const gameRoom = this.getGameRoom(gameId);
        if (!gameRoom) return false;
        if (gameRoom.gameMode === 'classic-mode') {
            return this.classicModeService.isGameFinished(gameRoom);
        }
    }

    updateGameHistory(endGame: EndGame): void {
        const gameHistory = this.getGameHistory(endGame.roomId);
        const gameRoom = this.getGameRoom(endGame.roomId);
        gameHistory.timer = gameRoom.userGame.timer;
        if (endGame.gameFinished) {
            if (endGame.winner) {
                gameHistory.winner = endGame.username;
            } else if (!gameHistory.username2) {
                gameHistory.winner = 'Aucun gagnant';
            }
        } else {
            gameHistory.abandonned = endGame.username;
        }
        this.setGameHistory(endGame.roomId, gameHistory);
    }

    abandonGameHistory(roomId: string, username: string): void {
        const gameHistory = this.getGameHistory(roomId);
        if (gameHistory.username2) {
            gameHistory.abandonned = username;
        } else {
            this.updateGameHistory({ roomId, gameFinished: false, winner: false, username });
        }
        this.setGameHistory(roomId, gameHistory);
    }

    initNewRoom(socket: Socket, gameRoom: GameRoom): void {
        gameRoom.roomId = socket.id;
        this.setGameRoom(gameRoom);
        socket.join(gameRoom.roomId);
    }

    canJoinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): GameRoom {
        const gameRoom = this.getGameModeRoom(data.gameName, data.gameMode);
        if (!gameRoom) return null;
        if (data.gameMode === 'classic-mode') {
            return this.classicModeService.canJoinGame(socket, gameRoom, data.username);
        }
    }

    getGameModeRoom(gameName: string, gameMode: string): GameRoom {
        for (const gameRoom of this.gameRooms.values()) {
            if (gameRoom.userGame.gameData.gameForm.name === gameName && gameRoom.gameMode === gameMode) {
                return gameRoom;
            }
        }
        return undefined;
    }

    applyTimeToTimer(roomId: string, time: number): void {
        const gameRoom = this.getGameRoom(roomId);
        gameRoom.userGame.timer += time;
        this.setGameRoom(gameRoom);
    }

    getRoomsValues(): GameRoom[] {
        return Array.from(this.gameRooms.values());
    }

    updateTimer(gameRoom: GameRoom): void {
        gameRoom.userGame.timer++;
        this.setGameRoom(gameRoom);
    }
}
