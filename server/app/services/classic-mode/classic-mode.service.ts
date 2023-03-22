import { EMPTY_PIXEL_VALUE } from '@app/constants';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ClassicModeService {
    private gameRooms: Map<string, GameRoom> = new Map<string, GameRoom>();

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
}
