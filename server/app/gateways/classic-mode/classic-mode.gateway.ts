import { ClassicModeEvents, DelayBeforeEmittingTime } from '@app/gateways/classic-mode/classic-mode.gateway.variables';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ClassicModeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger, private readonly classicModeService: ClassicModeService) {}

    @SubscribeMessage(ClassicModeEvents.Start)
    startGame(socket: Socket, roomId: string): void {
        const gameRoom = this.classicModeService.getRoom(roomId);
        this.logger.log(`Launching the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(roomId).emit(ClassicModeEvents.Started);
    }

    @SubscribeMessage(ClassicModeEvents.ValidateDifference)
    validateDifference(socket: Socket, data: { differencePos: Vector2D; roomId: string; username: string }): void {
        const validated = this.classicModeService.validateDifference(data.roomId, data.differencePos);
        this.server.to(data.roomId).emit(ClassicModeEvents.DifferenceValidated, { validated, differencePos: data[0], username: data[2] });
        if (this.classicModeService.isGameFinished(data.roomId)) {
            this.endGame(socket, { roomId: data.roomId, username: data.username });
        }
    }

    @SubscribeMessage(ClassicModeEvents.EndGame)
    endGame(socket: Socket, data: { roomId: string; username: string }): void {
        const gameRoom = this.classicModeService.getRoom(data.roomId);
        if (!gameRoom) return;
        this.logger.log(`End of game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(data.roomId).emit(ClassicModeEvents.GameFinished);
        this.classicModeService.deleteRoom(data.roomId);
    }

    @SubscribeMessage(ClassicModeEvents.Abandoned)
    abandoned(socket: Socket, data: { roomId: string; username: string }): void {
        this.server.to(data.roomId).emit(ClassicModeEvents.Abandoned, data.username);
    }

    @SubscribeMessage(ClassicModeEvents.CheckGame)
    checkGame(socket: Socket, gameName: string): void {
        if (this.classicModeService.getGameRoom(gameName)) {
            this.logger.log(`Game ${gameName} found`);
            this.server.to(socket.id).emit(ClassicModeEvents.GameFound, gameName);
        }
    }

    @SubscribeMessage(ClassicModeEvents.CreateGame)
    createGame(socket: Socket, gameRoom: GameRoom): void {
        const newRoom = this.classicModeService.initNewRoom(socket, gameRoom.userGame, gameRoom.started);
        this.logger.log(`Create the game: ${newRoom.userGame.gameData.gameForm.name}`);
        this.server.to(newRoom.roomId).emit(ClassicModeEvents.GameCreated, newRoom);
        this.server.emit(ClassicModeEvents.GameFound, newRoom.userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.CanJoinGame)
    canJoinGame(socket: Socket, data: { gameName: string; username: string }): void {
        if (this.classicModeService.canJoinGame(socket, data.gameName, data.username)) {
            this.logger.log(`${data.username} can join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CanJoinGame);
        } else {
            this.logger.log(`${data.username} cannot join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CannotJoinGame);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AskingToJoinGame)
    joinGame(socket: Socket, data: { gameName: string; username: string }): void {
        if (this.classicModeService.joinGame(socket, data.gameName, data.username)) {
            this.logger.log(`${data.username} joined the game: ${data.gameName}`);
            this.server.emit(ClassicModeEvents.GameInfo, this.classicModeService.getGameRoom(data.gameName));
        } else {
            this.logger.log(`Jeu: ${data.gameName} not found`);
            this.server.emit(ClassicModeEvents.GameInfo, undefined);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AbortGameCreation)
    abortGameCreation(socket: Socket): void {
        const gameRoom = this.classicModeService.getRoom(socket.id);
        this.logger.log(`Game creation aborted: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.classicModeService.deleteRoom(socket.id);
        this.server.emit(ClassicModeEvents.GameDeleted, gameRoom.userGame.gameData.gameForm.name);
        this.server.emit(ClassicModeEvents.GameCanceled, gameRoom.userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.LeaveGame)
    leaveGame(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.classicModeService.getRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`${playerInfo.username} left the game: ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
            this.classicModeService.setRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.GameInfo, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.RejectPlayer)
    playerRejected(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.classicModeService.getRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`${playerInfo[1]} rejected from game: ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
            this.classicModeService.setRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.PlayerRejected, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AcceptPlayer)
    playerAccepted(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.classicModeService.getRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`${playerInfo.username} accepted in game:  ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = [];
            gameRoom.userGame.username2 = playerInfo.username;
            gameRoom.started = true;
            this.classicModeService.setRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.PlayerAccepted, gameRoom);
        }
    }

    afterInit(): void {
        setInterval(() => {
            this.emitTime();
        }, DelayBeforeEmittingTime.DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket): void {
        this.logger.log(`Connection of user with id: ${socket.id}`);
    }

    handleDisconnect(socket: Socket): void {
        this.logger.log(`${socket.id}: disconnected`);
        const gameRoom = this.classicModeService.getRoom(socket.id);
        if (gameRoom && !gameRoom.userGame.username2) {
            this.logger.log(`Game deleted: ${this.classicModeService.getRoom(socket.id).userGame.gameData.gameForm.name}`);
            this.server.emit(ClassicModeEvents.GameDeleted, this.classicModeService.getRoom(socket.id).userGame.gameData.gameForm.name);
            this.classicModeService.deleteRoom(socket.id);
        }
    }

    emitTime(): void {
        for (const gameRoom of this.classicModeService.getRoomsValues()) {
            if (gameRoom.started) {
                this.classicModeService.updateTimer(gameRoom);
                this.server.to(gameRoom.roomId).emit(ClassicModeEvents.Timer, this.classicModeService.getRoom(gameRoom.roomId).userGame.timer);
            }
        }
    }

    cancelDeletedGame(gameName: string): void {
        this.server.emit(ClassicModeEvents.GameCanceled, gameName);
    }
}
