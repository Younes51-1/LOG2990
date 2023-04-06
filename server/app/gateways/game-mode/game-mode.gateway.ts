import { ClassicModeEvents, DelayBeforeEmittingTime } from '@app/gateways/game-mode/game-mode.gateway.variables';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ClassicModeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private readonly gameModeService: GameModeService,
        private readonly gameHistoryService: GameHistoryService,
    ) {}

    @SubscribeMessage(ClassicModeEvents.Start)
    startGame(socket: Socket, roomId: string): void {
        const gameRoom = this.gameModeService.getGameRoom(roomId);
        this.gameModeService.saveGameHistory(gameRoom);
        this.logger.log(`Launching the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(roomId).emit(ClassicModeEvents.Started, gameRoom);
    }

    @SubscribeMessage(ClassicModeEvents.ValidateDifference)
    validateDifference(socket: Socket, data: { differencePos: Vector2D; roomId: string; username: string }): void {
        const validated = this.gameModeService.validateDifference(data.roomId, data.differencePos);
        this.server
            .to(data.roomId)
            .emit(ClassicModeEvents.DifferenceValidated, { validated, differencePos: data.differencePos, username: data.username });
        if (this.gameModeService.isGameFinished(data.roomId)) {
            const endGame = {} as EndGame;
            endGame.gameFinished = true;
            endGame.winner = true;
            endGame.roomId = data.roomId;
            endGame.username = data.username;
            this.endGame(socket, endGame);
        }
    }

    @SubscribeMessage(ClassicModeEvents.EndGame)
    endGame(socket: Socket, endGame: EndGame): void {
        const gameRoom = this.gameModeService.getGameRoom(endGame.roomId);
        if (!gameRoom || !endGame) return;
        this.logger.log(`End of game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(endGame.roomId).emit(ClassicModeEvents.GameFinished);
        this.gameModeService.updateGameHistory(endGame);
        const gameHistory = this.gameModeService.getGameHistory(endGame.roomId);
        this.gameHistoryService.saveGameHistory(gameHistory);
        this.gameModeService.deleteRoom(endGame.roomId);
    }

    @SubscribeMessage(ClassicModeEvents.Abandoned)
    abandoned(socket: Socket, data: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(data.roomId);
        if (!gameRoom) return;
        if (gameRoom.gameMode === 'classic-mode') {
            this.gameModeService.abandonGameHistory(data.roomId, data.username);

            if (!gameRoom.userGame.username2) {
                const gameHistory = this.gameModeService.getGameHistory(data.roomId);
                this.gameHistoryService.saveGameHistory(gameHistory);
            }
            this.server.to(data.roomId).emit(ClassicModeEvents.Abandoned, data.username);
        } else {
            if (gameRoom.userGame.username1 === data.username) {
                gameRoom.userGame.username1 = gameRoom.userGame.username2;
                gameRoom.userGame.username2 = '';
            } else {
                gameRoom.userGame.username2 = '';
            }
            const sockets = this.server.sockets.adapter.rooms.get(data.roomId);
            if (socket.id === gameRoom.roomId) {
                sockets.delete(gameRoom.roomId);
                gameRoom.roomId = Array.from(sockets.keys())[0];
                const gameHistory = this.gameModeService.getGameHistory(data.roomId);
                this.gameModeService.deleteGameHistory(socket.id);
                this.gameModeService.setGameHistory(gameRoom.roomId, gameHistory);
            } else {
                sockets.delete(socket.id);
            }
            gameRoom.gameMode = 'classic-mode';
            this.gameModeService.deleteRoom(socket.id);
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.Abandoned, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.CheckGame)
    checkGame(socket: Socket, data: { gameName: string; gameMode: string }): void {
        if (this.gameModeService.getGameRoom(undefined, data.gameName, data.gameMode)) {
            this.logger.log(`Game ${data.gameName} found`);
            this.server.to(socket.id).emit(ClassicModeEvents.GameFound, { gameName: data.gameName, gameMode: data.gameMode });
        }
    }

    @SubscribeMessage(ClassicModeEvents.CreateGame)
    createGame(socket: Socket, gameRoom: GameRoom): void {
        this.gameModeService.initNewRoom(socket, gameRoom);
        this.logger.log(`Create the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(gameRoom.roomId).emit(ClassicModeEvents.GameCreated, gameRoom);
        this.server.emit(ClassicModeEvents.GameFound, gameRoom.userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.CanJoinGame)
    canJoinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): void {
        if (this.gameModeService.canJoinGame(socket, data)) {
            this.logger.log(`${data.username} can join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CanJoinGame);
        } else {
            this.logger.log(`${data.username} cannot join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CannotJoinGame);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AskingToJoinGame)
    joinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): void {
        if (this.gameModeService.joinGame(socket, data)) {
            this.logger.log(`${data.username} joined the game: ${data.gameName}`);
            this.server.emit(ClassicModeEvents.GameInfo, this.gameModeService.getGameRoom(undefined, data.gameName, data.gameMode));
        } else {
            this.logger.log(`Jeu: ${data.gameName} not found`);
            this.server.emit(ClassicModeEvents.GameInfo, undefined);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AbortGameCreation)
    abortGameCreation(socket: Socket, roomId: string): void {
        const gameRoom = this.gameModeService.getGameRoom(roomId);
        if (!gameRoom) return;
        this.logger.log(`Game creation aborted: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.gameModeService.deleteRoom(roomId);
        this.server.emit(ClassicModeEvents.GameDeleted, gameRoom.userGame.gameData.gameForm.name);
        this.server.emit(ClassicModeEvents.GameCanceled, gameRoom.userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.LeaveGame)
    leaveGame(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (!gameRoom) return;
        this.logger.log(`${playerInfo.username} left the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
        this.gameModeService.setGameRoom(gameRoom);
        this.server.to(gameRoom.roomId).emit(ClassicModeEvents.GameInfo, gameRoom);
    }

    @SubscribeMessage(ClassicModeEvents.RejectPlayer)
    playerRejected(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`${playerInfo.username} rejected from game: ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.PlayerRejected, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AcceptPlayer)
    playerAccepted(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`${playerInfo.username} accepted in game:  ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = [];
            gameRoom.userGame.username2 = playerInfo.username;
            gameRoom.started = true;
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.PlayerAccepted, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.ChangeTime)
    changeTime(socket: Socket, data: { roomId: string; time: number }): void {
        this.logger.log(`Time changed by ${data.time} in game: ${data.roomId}`);
        this.gameModeService.applyTimeToTimer(data.roomId, data.time);
    }

    @SubscribeMessage(ClassicModeEvents.NextGame)
    nextGame(socket: Socket, gameRoom: GameRoom): void {
        this.gameModeService.nextGame(gameRoom);
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
        const gameRoom = this.gameModeService.getGameRoom(socket.id);
        if (gameRoom && !gameRoom.userGame.username2) {
            this.logger.log(`Game deleted: ${this.gameModeService.getGameRoom(socket.id).userGame.gameData.gameForm.name}`);
            this.server.emit(ClassicModeEvents.GameDeleted, this.gameModeService.getGameRoom(socket.id).userGame.gameData.gameForm.name);
            this.gameModeService.deleteRoom(socket.id);
        }
    }

    emitTime(): void {
        for (const gameRoom of this.gameModeService.getRoomsValues()) {
            if (gameRoom.started) {
                this.gameModeService.updateTimer(gameRoom);
                this.server.to(gameRoom.roomId).emit(ClassicModeEvents.Timer, gameRoom.userGame.timer);
            }
        }
    }

    cancelDeletedGame(gameName: string): void {
        this.logger.log(`Game canceled: ${gameName}`);
        this.server.emit(ClassicModeEvents.GameCanceled, gameName);
    }
}
