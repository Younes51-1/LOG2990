import { WaitingRoomEvents } from '@app/gateways/waiting-room/waiting-room.gateway.variables';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class WaitingRoomGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private readonly gameModeService: GameModeService,
        private readonly gameHistoryService: GameHistoryService,
    ) {}

    @SubscribeMessage(WaitingRoomEvents.Start)
    startGame(socket: Socket, roomId: string): void {
        const gameRoom = this.gameModeService.getGameRoom(roomId);
        this.gameModeService.saveGameHistory(gameRoom);
        this.logger.log(`Waiting room gateway: Launching the game: ${gameRoom.userGame.gameData.name}`);
        this.server.to(roomId).emit(WaitingRoomEvents.Started, gameRoom);
    }

    @SubscribeMessage(WaitingRoomEvents.CreateGame)
    createGame(socket: Socket, gameRoom: GameRoom): void {
        this.gameModeService.initNewRoom(socket, gameRoom);
        this.logger.log(`Waiting room gateway: Create the game: ${gameRoom.userGame.gameData.name}`);
        this.server.to(gameRoom.roomId).emit(WaitingRoomEvents.GameCreated, gameRoom);
        this.server.emit(WaitingRoomEvents.GameFound, { gameName: gameRoom.userGame.gameData.name, gameMode: gameRoom.gameMode });
    }

    @SubscribeMessage(WaitingRoomEvents.AskingToJoinGame)
    joinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): void {
        if (this.gameModeService.joinGame(socket, data)) {
            this.logger.log(`Waiting room gateway: ${data.username} joined the game: ${data.gameName}`);
            this.server.emit(WaitingRoomEvents.GameInfo, this.gameModeService.getGameRoom(undefined, data.gameName, data.gameMode));
        } else {
            this.logger.log(`Waiting room gateway: Jeu: ${data.gameName} not found`);
            this.server.emit(WaitingRoomEvents.GameInfo, undefined);
        }
    }

    @SubscribeMessage(WaitingRoomEvents.AbortGameCreation)
    abortGameCreation(socket: Socket, roomId: string): void {
        const gameRoom = this.gameModeService.getGameRoom(roomId);
        if (!gameRoom) return;
        this.logger.log(`Waiting room gateway: Game creation aborted: ${gameRoom.userGame.gameData.name}`);
        this.gameModeService.deleteRoom(roomId);
        this.server.emit(WaitingRoomEvents.GameDeleted, { gameName: gameRoom.userGame.gameData.name, gameMode: gameRoom.gameMode });
        this.server.emit(WaitingRoomEvents.GameCanceled, gameRoom.userGame.gameData.name);
    }

    @SubscribeMessage(WaitingRoomEvents.RejectPlayer)
    playerRejected(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`Waiting room gateway: ${playerInfo.username} rejected from game: ${gameRoom.userGame.gameData.name}`);
            gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(WaitingRoomEvents.PlayerRejected, gameRoom);
        }
    }

    @SubscribeMessage(WaitingRoomEvents.AcceptPlayer)
    playerAccepted(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`Waiting room gateway: ${playerInfo.username} accepted in game:  ${gameRoom.userGame.gameData.name}`);
            gameRoom.userGame.potentialPlayers = [];
            gameRoom.userGame.username2 = playerInfo.username;
            gameRoom.started = true;
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(WaitingRoomEvents.PlayerAccepted, gameRoom);
        }
    }

    @SubscribeMessage(WaitingRoomEvents.LeaveGame)
    leaveGame(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (!gameRoom) return;
        this.logger.log(`Waiting room gateway: ${playerInfo.username} left the game: ${gameRoom.userGame.gameData.name}`);
        gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
        this.gameModeService.setGameRoom(gameRoom);
        this.server.to(gameRoom.roomId).emit(WaitingRoomEvents.GameInfo, gameRoom);
    }

    handleDisconnect(socket: Socket): void {
        const gameRoom = this.gameModeService.getGameRoom(socket.id);
        if (!gameRoom || gameRoom.started) return;
        this.logger.log(`Waiting room gateway: ${socket.id}: disconnected`);
        if (gameRoom.roomId === socket.id) {
            this.abortGameCreation(socket, socket.id);
        } else {
            this.leaveGame(socket, { roomId: gameRoom.roomId, username: gameRoom.userGame.username2 });
        }
    }
}
