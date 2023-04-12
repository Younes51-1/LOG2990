import { EMPTY_PIXEL_VALUE } from '@app/constants';
import { GameHistory } from '@app/model/database/game-history';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameModeService {
    private gameRooms: Map<string, GameRoom> = new Map<string, GameRoom>();
    private gameHistory: Map<string, GameHistory> = new Map<string, GameHistory>();

    constructor(private gameHistoryService: GameHistoryService) {}
    getGameRoom(roomId?: string, gameName?: string, gameMode?: string): GameRoom {
        if (roomId) return this.gameRooms.get(roomId);
        if (gameMode === 'classic-mode') {
            for (const gameRoom of this.gameRooms.values()) {
                if (gameRoom.userGame.gameData.name === gameName && gameRoom.gameMode === gameMode) return gameRoom;
            }
        } else {
            for (const gameRoom of this.gameRooms.values()) {
                if (gameRoom.gameMode === gameMode) return gameRoom;
            }
        }
        return undefined;
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

    deleteGameHistory(roomId: string): void {
        this.gameHistory.delete(roomId);
    }

    deleteRoom(roomId: string): void {
        this.gameRooms.delete(roomId);
    }

    nextGame(gameRoom: GameRoom): void {
        if (gameRoom.gameMode === 'classic-mode') return;
        this.setGameRoom(gameRoom);
    }

    joinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): boolean {
        const gameRoom = this.getGameRoom(undefined, data.gameName, data.gameMode);
        if (!gameRoom) return false;
        gameRoom.userGame.potentialPlayers.push(data.username);
        this.setGameRoom(gameRoom);
        socket.join(gameRoom.roomId);
        return true;
    }

    saveGameHistory(gameRoom: GameRoom): void {
        const newGameHistory = new GameHistory();
        newGameHistory.name = gameRoom.userGame.gameData.name;
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
        } else {
            if (gameRoom.userGame.username2) {
                newGameHistory.gameMode = 'Mode Temps Limité  Multi-joueur';
            } else {
                newGameHistory.gameMode = 'Mode Temps Limité  Solo';
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
            return gameRoom.userGame.nbDifferenceFound === gameRoom.userGame.gameData.nbDifference;
        } else {
            return gameRoom.userGame.timer <= 0;
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
        const gameRoom = this.getGameRoom(undefined, data.gameName, data.gameMode);
        if (!gameRoom) return null;
        if (!gameRoom.userGame.potentialPlayers) {
            gameRoom.userGame.potentialPlayers = [];
        }
        if (gameRoom.userGame.username1.toLowerCase() === data.username.toLowerCase()) {
            return undefined;
        }
        if (gameRoom.userGame.potentialPlayers.some((player) => player.toLowerCase() === data.username.toLowerCase())) {
            return undefined;
        }
        return gameRoom;
    }

    applyTimeToTimer(roomId: string, time: number): void {
        const gameRoom = this.getGameRoom(roomId);
        if (!gameRoom) return;
        gameRoom.userGame.timer += time;
        this.setGameRoom(gameRoom);
    }

    getRoomsValues(): GameRoom[] {
        return Array.from(this.gameRooms.values());
    }

    updateTimer(gameRoom: GameRoom): void {
        if (gameRoom.gameMode === 'classic-mode') {
            gameRoom.userGame.timer++;
        } else {
            gameRoom.userGame.timer--;
            const twoMin = 120;
            if (gameRoom.userGame.timer > twoMin) {
                gameRoom.userGame.timer = twoMin;
            } else if (gameRoom.userGame.timer < 0) {
                gameRoom.userGame.timer = 0;
            }
        }
        this.setGameRoom(gameRoom);
    }

    endGame(endGame: EndGame): void {
        this.updateGameHistory(endGame);
        const gameHistory = this.getGameHistory(endGame.roomId);
        this.gameHistoryService.saveGameHistory(gameHistory);
        this.deleteRoom(endGame.roomId);
    }

    abandonClassicMode(gameRoom: GameRoom, username: string): void {
        this.abandonGameHistory(gameRoom.roomId, username);

        if (!gameRoom.userGame.username2) {
            const gameHistory = this.getGameHistory(gameRoom.roomId);
            this.gameHistoryService.saveGameHistory(gameHistory);
        }
    }

    abandonLimitedTimeMode(gameRoom: GameRoom, username: string, socketId: string): void {
        if (gameRoom.userGame.username1 === username) {
            gameRoom.userGame.username1 = gameRoom.userGame.username2;
        }
        gameRoom.userGame.username2 = '';
        const gameHistory = this.getGameHistory(gameRoom.roomId);
        this.setGameHistory(gameRoom.roomId, gameHistory);
        this.setGameRoom(gameRoom);
    }
}
