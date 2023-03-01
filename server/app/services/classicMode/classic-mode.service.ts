import { EMPTY_PIXEL_VALUE } from '@app/constants';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ClassicModeService {
    gameRooms: Map<string, GameRoom>;

    constructor() {
        this.gameRooms = new Map<string, GameRoom>();
    }

    initNewRoom(socket: Socket, userGame: UserGame, started: boolean): string {
        const newRoom = { userGame, roomId: socket.id, started };
        this.gameRooms.set(newRoom.roomId, newRoom);
        socket.join(newRoom.roomId);
        return newRoom.roomId;
    }

    validateDifference(gameId: string, differencePos: Vector2D): boolean {
        const gameRoom = this.gameRooms.get(gameId);
        if (gameRoom === undefined) return false;
        const validated = gameRoom.userGame.gameData.differenceMatrix[differencePos.y][differencePos.x] !== EMPTY_PIXEL_VALUE;
        if (validated) {
            gameRoom.userGame.nbDifferenceFound++;
            this.gameRooms.set(gameRoom.roomId, gameRoom);
        }
        return validated;
    }

    isGameFinished(gameId: string): boolean {
        const gameRoom = this.gameRooms.get(gameId);
        return gameRoom.userGame.nbDifferenceFound === gameRoom.userGame.gameData.gameForm.nbDifference;
    }

    updateTimer(gameRoom: GameRoom): void {
        gameRoom.userGame.timer++;
        this.gameRooms.set(gameRoom.roomId, gameRoom);
    }

    deleteRoom(roomId: string): void {
        this.gameRooms.delete(roomId);
    }
}
