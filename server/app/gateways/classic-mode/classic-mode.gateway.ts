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
    startGame(socket: Socket, roomId: string) {
        const gameRoom = this.classicModeService.gameRooms.get(roomId);
        this.logger.log(`Launching the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(roomId).emit(ClassicModeEvents.Started);
    }

    @SubscribeMessage(ClassicModeEvents.ValidateDifference)
    validateDifference(socket: Socket, data: [differencePos: Vector2D, roomId: string, username: string]) {
        const validated = this.classicModeService.validateDifference(data[1], data[0]);
        this.server.to(data[1]).emit(ClassicModeEvents.DifferenceValidated, { validated, differencePos: data[0], username: data[2] });
        if (this.classicModeService.isGameFinished(data[1])) {
            this.endGame(socket, [data[1], data[2]]);
        }
    }

    @SubscribeMessage(ClassicModeEvents.EndGame)
    endGame(socket: Socket, data: [roomId: string, userName: string]) {
        const gameRoom = this.classicModeService.gameRooms.get(data[0]);
        if (!gameRoom) return;
        this.logger.log(`End of game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(data[0]).emit(ClassicModeEvents.GameFinished);
        this.classicModeService.deleteRoom(data[0]);
    }

    @SubscribeMessage(ClassicModeEvents.Abandoned)
    abandoned(socket: Socket, data: [roomId: string, userName: string]) {
        this.server.to(data[0]).emit(ClassicModeEvents.Abandoned, data[1]);
    }

    @SubscribeMessage(ClassicModeEvents.CheckGame)
    checkGame(socket: Socket, gameName: string) {
        if (this.classicModeService.getGameRoom(gameName)) {
            this.logger.log(`Game ${gameName} found`);
            this.server.to(socket.id).emit(ClassicModeEvents.GameFound, gameName);
        }
    }

    @SubscribeMessage(ClassicModeEvents.CreateGame)
    createGame(socket: Socket, gameRoom: GameRoom) {
        const newRoom = this.classicModeService.initNewRoom(socket, gameRoom.userGame, gameRoom.started);
        this.logger.log(`Create the game: ${newRoom.userGame.gameData.gameForm.name}`);
        this.server.to(newRoom.roomId).emit(ClassicModeEvents.GameCreated, newRoom);
        this.server.emit(ClassicModeEvents.GameFound, newRoom.userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.CanJoinGame)
    canJoinGame(socket: Socket, userGame: [gameName: string, username: string]) {
        if (this.classicModeService.canJoinGame(socket, userGame[0], userGame[1])) {
            this.logger.log(`${userGame[1]} can join the game: ${userGame[0]}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CanJoinGame);
        } else {
            this.logger.log(`${userGame[1]} cannot join the game: ${userGame[0]}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CannotJoinGame);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AskingToJoinGame)
    joinGame(socket: Socket, userGame: [gameName: string, username: string]) {
        if (this.classicModeService.joinGame(socket, userGame[0], userGame[1])) {
            this.logger.log(`${userGame[1]} joined the game: ${userGame[0]}`);
            this.server.emit(ClassicModeEvents.GameInfo, this.classicModeService.getGameRoom(userGame[0]));
        } else {
            this.logger.log(`Jeu: ${userGame[0]} not found`);
            this.server.emit(ClassicModeEvents.GameInfo, undefined);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AbortGameCreation)
    abortGameCreation(socket: Socket) {
        const gameRoom = this.classicModeService.gameRooms.get(socket.id);
        this.logger.log(`Game creation aborted: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.classicModeService.deleteRoom(socket.id);
        this.server.emit(ClassicModeEvents.GameDeleted, gameRoom.userGame.gameData.gameForm.name);
        this.server.emit(ClassicModeEvents.GameCanceled, gameRoom.userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.LeaveGame)
    leaveGame(socket: Socket, playerInfo: [roomId: string, userName: string]) {
        const gameRoom = this.classicModeService.gameRooms.get(playerInfo[0]);
        if (gameRoom) {
            this.logger.log(`${playerInfo[1]} left the game: ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo[1]);
            this.classicModeService.gameRooms.set(gameRoom.roomId, gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.GameInfo, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.RejectPlayer)
    playerRejected(socket: Socket, playerInfo: [roomId: string, userName: string]) {
        const gameRoom = this.classicModeService.gameRooms.get(playerInfo[0]);
        if (gameRoom) {
            this.logger.log(`${playerInfo[1]} rejected from game: ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo[1]);
            this.classicModeService.gameRooms.set(gameRoom.roomId, gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.PlayerRejected, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AcceptPlayer)
    playerAccepted(socket: Socket, playerInfo: [roomId: string, userName: string]) {
        const gameRoom = this.classicModeService.gameRooms.get(playerInfo[0]);
        if (gameRoom) {
            this.logger.log(`${playerInfo[1]} accepted in game:  ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = [];
            gameRoom.userGame.username2 = playerInfo[1];
            gameRoom.started = true;
            this.classicModeService.gameRooms.set(gameRoom.roomId, gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.PlayerAccepted, gameRoom);
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DelayBeforeEmittingTime.DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connection of user with id: ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`${socket.id}: disconnected`);
        const gameRoom = this.classicModeService.gameRooms.get(socket.id);
        if (gameRoom && !gameRoom.userGame.username2) {
            this.logger.log(`Game deleted: ${this.classicModeService.gameRooms.get(socket.id).userGame.gameData.gameForm.name}`);
            this.server.emit(ClassicModeEvents.GameDeleted, this.classicModeService.gameRooms.get(socket.id).userGame.gameData.gameForm.name);
            this.classicModeService.deleteRoom(socket.id);
        }
    }

    emitTime() {
        for (const gameRoom of this.classicModeService.gameRooms.values()) {
            if (gameRoom.started) {
                this.classicModeService.updateTimer(gameRoom);
                this.server.to(gameRoom.roomId).emit(ClassicModeEvents.Timer, this.classicModeService.gameRooms.get(gameRoom.roomId).userGame.timer);
            }
        }
    }

    cancelDeletedGame(gameName: string): void {
        this.server.emit(ClassicModeEvents.GameCanceled, gameName);
    }
}
