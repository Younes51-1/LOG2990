import { GameModeEvents, DelayBeforeEmittingTime } from '@app/gateways/game-mode/game-mode.gateway.variables';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameModeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger, private readonly gameModeService: GameModeService) {}

    @SubscribeMessage(GameModeEvents.ValidateDifference)
    validateDifference(socket: Socket, data: { differencePos: Vector2D; roomId: string; username: string }): void {
        const validated = this.gameModeService.validateDifference(data.roomId, data.differencePos);
        this.server
            .to(data.roomId)
            .emit(GameModeEvents.DifferenceValidated, { validated, differencePos: data.differencePos, username: data.username });
        if (this.gameModeService.isGameFinished(data.roomId)) {
            const endGame = {} as EndGame;
            endGame.gameFinished = true;
            endGame.winner = true;
            endGame.roomId = data.roomId;
            endGame.username = data.username;
            this.endGame(socket, endGame);
        }
    }

    @SubscribeMessage(GameModeEvents.EndGame)
    endGame(socket: Socket, endGame: EndGame): void {
        const gameRoom = this.gameModeService.getGameRoom(endGame.roomId);
        if (!gameRoom || !endGame) return;
        this.logger.log(`Game mode gateway: End of game: ${gameRoom.userGame.gameData.name}`);
        this.server.to(endGame.roomId).emit(GameModeEvents.GameFinished);
        this.gameModeService.endGame(endGame);
    }

    @SubscribeMessage(GameModeEvents.Abandoned)
    abandoned(socket: Socket, data: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(data.roomId);
        if (!gameRoom) return;
        if (gameRoom.gameMode === 'classic-mode') {
            this.gameModeService.abandonClassicMode(gameRoom, data.username);
            this.logger.log(`Game mode gateway: ${data.username}: abandoned classic mode game`);
            this.server.to(data.roomId).emit(GameModeEvents.Abandoned, { gameRoom, username: data.username });
        } else {
            const sockets = this.server.sockets.adapter.rooms.get(data.roomId);
            sockets.delete(socket.id);
            if (socket.id === gameRoom.roomId) {
                socket.leave(data.roomId);
                gameRoom.roomId = Array.from(sockets.keys())[0];
            } else {
                socket.leave(socket.id);
            }
            this.gameModeService.abandonLimitedTimeMode(gameRoom, data.username);
            this.server.to(gameRoom.roomId).emit(GameModeEvents.Abandoned, { gameRoom, username: data.username });
        }
    }

    @SubscribeMessage(GameModeEvents.ChangeTime)
    changeTime(socket: Socket, data: { roomId: string; time: number }): void {
        this.logger.log(`Game mode gateway: Time changed: ${data.time}`);
        this.gameModeService.applyTimeToTimer(data.roomId, data.time);
    }

    @SubscribeMessage(GameModeEvents.NextGame)
    nextGame(socket: Socket, gameRoom: GameRoom): void {
        this.gameModeService.nextGame(gameRoom);
    }

    afterInit(): void {
        setInterval(() => {
            this.emitTime();
        }, DelayBeforeEmittingTime.DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket): void {
        this.logger.log(`Game mode gateway: Connection of user with id: ${socket.id}`);
    }

    handleDisconnect(socket: Socket): void {
        const gameRoom = this.gameModeService.getGameRoom(socket.id);
        if (!gameRoom || gameRoom.userGame.username2 || !gameRoom.started) return;
        this.logger.log(`Game mode gateway: ${socket.id}: disconnected`);
        this.logger.log(`Game deleted: ${gameRoom.userGame.gameData.name}`);
        this.server.emit(GameModeEvents.GameDeleted, { gameName: gameRoom.userGame.gameData.name, gameMode: gameRoom.gameMode });
        this.gameModeService.deleteRoom(socket.id);
    }

    emitTime(): void {
        for (const gameRoom of this.gameModeService.getRoomsValues()) {
            if (gameRoom.started) {
                this.gameModeService.updateTimer(gameRoom);
                this.server.to(gameRoom.roomId).emit(GameModeEvents.Timer, gameRoom.userGame.timer);
            }
        }
    }

    cancelDeletedGame(gameName: string): void {
        this.logger.log(`Game mode gateway: Game canceled: ${gameName}`);
        this.server.emit(GameModeEvents.GameCanceled, gameName);
    }
}
