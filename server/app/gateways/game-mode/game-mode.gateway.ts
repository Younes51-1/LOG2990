import { GameModeEvents, DelayBeforeEmittingTime } from '@app/gateways/game-mode/game-mode.gateway.variables';
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
export class GameModeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private readonly gameModeService: GameModeService,
        private readonly gameHistoryService: GameHistoryService,
    ) {}

    @SubscribeMessage(GameModeEvents.Start)
    startGame(socket: Socket, roomId: string): void {
        const gameRoom = this.gameModeService.getGameRoom(roomId);
        this.gameModeService.saveGameHistory(gameRoom);
        this.logger.log(`Launching the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(roomId).emit(GameModeEvents.Started, gameRoom);
    }

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
        this.logger.log(`End of game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(endGame.roomId).emit(GameModeEvents.GameFinished);
        this.gameModeService.updateGameHistory(endGame);
        const gameHistory = this.gameModeService.getGameHistory(endGame.roomId);
        this.gameHistoryService.saveGameHistory(gameHistory);
        this.gameModeService.deleteRoom(endGame.roomId);
    }

    @SubscribeMessage(GameModeEvents.Abandoned)
    abandoned(socket: Socket, data: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(data.roomId);
        if (!gameRoom) return;
        if (gameRoom.gameMode === 'classic-mode') {
            this.gameModeService.abandonGameHistory(data.roomId, data.username);

            if (!gameRoom.userGame.username2) {
                const gameHistory = this.gameModeService.getGameHistory(data.roomId);
                this.gameHistoryService.saveGameHistory(gameHistory);
            }
            this.server.to(data.roomId).emit(GameModeEvents.Abandoned, data.username);
        } else {
            if (gameRoom.userGame.username1 === data.username) {
                gameRoom.userGame.username1 = gameRoom.userGame.username2;
                gameRoom.userGame.username2 = '';
            } else {
                gameRoom.userGame.username2 = '';
            }
            const sockets = this.server.sockets.adapter.rooms.get(data.roomId);
            sockets.delete(socket.id);
            if (socket.id === gameRoom.roomId) {
                socket.leave(data.roomId);
                gameRoom.roomId = Array.from(sockets.keys())[0];
                const gameHistory = this.gameModeService.getGameHistory(data.roomId);
                this.gameModeService.deleteGameHistory(socket.id);
                this.gameModeService.setGameHistory(gameRoom.roomId, gameHistory);
            } else {
                socket.leave(socket.id);
            }
            gameRoom.gameMode = 'classic-mode';
            this.gameModeService.deleteRoom(socket.id);
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(GameModeEvents.Abandoned, gameRoom);
        }
    }

    @SubscribeMessage(GameModeEvents.CheckGame)
    checkGame(socket: Socket, data: { gameName: string; gameMode: string }): void {
        if (this.gameModeService.getGameRoom(undefined, data.gameName, data.gameMode)) {
            this.logger.log(`Game ${data.gameName} found`);
            this.server.to(socket.id).emit(GameModeEvents.GameFound, { gameName: data.gameName, gameMode: data.gameMode });
        }
    }

    @SubscribeMessage(GameModeEvents.CreateGame)
    createGame(socket: Socket, gameRoom: GameRoom): void {
        this.gameModeService.initNewRoom(socket, gameRoom);
        this.logger.log(`Create the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.server.to(gameRoom.roomId).emit(GameModeEvents.GameCreated, gameRoom);
        this.server.emit(GameModeEvents.GameFound, { gameName: gameRoom.userGame.gameData.gameForm.name, gameMode: gameRoom.gameMode });
    }

    @SubscribeMessage(GameModeEvents.CanJoinGame)
    canJoinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): void {
        if (this.gameModeService.canJoinGame(socket, data)) {
            this.logger.log(`${data.username} can join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(GameModeEvents.CanJoinGame);
        } else {
            this.logger.log(`${data.username} cannot join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(GameModeEvents.CannotJoinGame);
        }
    }

    @SubscribeMessage(GameModeEvents.AskingToJoinGame)
    joinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): void {
        if (this.gameModeService.joinGame(socket, data)) {
            this.logger.log(`${data.username} joined the game: ${data.gameName}`);
            this.server.emit(GameModeEvents.GameInfo, this.gameModeService.getGameRoom(undefined, data.gameName, data.gameMode));
        } else {
            this.logger.log(`Jeu: ${data.gameName} not found`);
            this.server.emit(GameModeEvents.GameInfo, undefined);
        }
    }

    @SubscribeMessage(GameModeEvents.AbortGameCreation)
    abortGameCreation(socket: Socket, roomId: string): void {
        const gameRoom = this.gameModeService.getGameRoom(roomId);
        if (!gameRoom) return;
        this.logger.log(`Game creation aborted: ${gameRoom.userGame.gameData.gameForm.name}`);
        this.gameModeService.deleteRoom(roomId);
        this.server.emit(GameModeEvents.GameDeleted, { gameName: gameRoom.userGame.gameData.gameForm.name, gameMode: gameRoom.gameMode });
        this.server.emit(GameModeEvents.GameCanceled, gameRoom.userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(GameModeEvents.LeaveGame)
    leaveGame(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (!gameRoom) return;
        this.logger.log(`${playerInfo.username} left the game: ${gameRoom.userGame.gameData.gameForm.name}`);
        gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
        this.gameModeService.setGameRoom(gameRoom);
        this.server.to(gameRoom.roomId).emit(GameModeEvents.GameInfo, gameRoom);
    }

    @SubscribeMessage(GameModeEvents.RejectPlayer)
    playerRejected(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`${playerInfo.username} rejected from game: ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = gameRoom.userGame.potentialPlayers.filter((player) => player !== playerInfo.username);
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(GameModeEvents.PlayerRejected, gameRoom);
        }
    }

    @SubscribeMessage(GameModeEvents.AcceptPlayer)
    playerAccepted(socket: Socket, playerInfo: { roomId: string; username: string }): void {
        const gameRoom = this.gameModeService.getGameRoom(playerInfo.roomId);
        if (gameRoom) {
            this.logger.log(`${playerInfo.username} accepted in game:  ${gameRoom.userGame.gameData.gameForm.name}`);
            gameRoom.userGame.potentialPlayers = [];
            gameRoom.userGame.username2 = playerInfo.username;
            gameRoom.started = true;
            this.gameModeService.setGameRoom(gameRoom);
            this.server.to(gameRoom.roomId).emit(GameModeEvents.PlayerAccepted, gameRoom);
        }
    }

    @SubscribeMessage(GameModeEvents.ChangeTime)
    changeTime(socket: Socket, data: { roomId: string; time: number }): void {
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
        this.logger.log(`Connection of user with id: ${socket.id}`);
    }

    handleDisconnect(socket: Socket): void {
        this.logger.log(`${socket.id}: disconnected`);
        const gameRoom = this.gameModeService.getGameRoom(socket.id);
        if (gameRoom && !gameRoom.userGame.username2) {
            this.logger.log(`Game deleted: ${gameRoom.userGame.gameData.gameForm.name}`);
            this.server.emit(GameModeEvents.GameDeleted, { gameName: gameRoom.userGame.gameData.gameForm.name, gameMode: gameRoom.gameMode });
            this.gameModeService.deleteRoom(socket.id);
        }
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
        this.logger.log(`Game canceled: ${gameName}`);
        this.server.emit(GameModeEvents.GameCanceled, gameName);
    }
}