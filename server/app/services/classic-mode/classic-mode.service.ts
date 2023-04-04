import { GameRoom } from '@app/model/schema/game-room.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameModeService } from '@app/services/game-mode/game-mode.service';

@Injectable()
export class ClassicModeService {
    gameModeService: GameModeService;

    setGameModeService(gameModeService: GameModeService): void {
        this.gameModeService = gameModeService;
    }

    canJoinGame(socket: Socket, gameRoom: GameRoom, userName: string): GameRoom {
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

    joinGame(socket: Socket, gameRoom: GameRoom, username: string): boolean {
        gameRoom.userGame.potentialPlayers.push(username);
        this.gameModeService.setGameRoom(gameRoom);
        socket.join(gameRoom.roomId);
        return true;
    }

    isGameFinished(gameRoom: GameRoom): boolean {
        return gameRoom.userGame.nbDifferenceFound === gameRoom.userGame.gameData.gameForm.nbDifference;
    }

    getRoomsValues(): GameRoom[] {
        return Array.from(this.gameModeService.gameRooms.values());
    }

    getGameRoom(gameName: string): GameRoom {
        for (const gameRoom of this.getRoomsValues()) {
            if (
                !gameRoom.started &&
                gameRoom.userGame.gameData.gameForm.name.toLocaleLowerCase() === gameName.toLocaleLowerCase() &&
                gameRoom.gameMode === 'classic-mode'
            ) {
                return gameRoom;
            }
        }
        return undefined;
    }
}
