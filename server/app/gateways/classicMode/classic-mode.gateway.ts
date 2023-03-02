import { UserGame } from '@app/model/schema/user-game.schema';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClassicModeEvents, DelayBeforeEmmitingTime } from '@app/gateways/classicMode/classic-mode.gateway.variables';

@WebSocketGateway({ cors: true })
@Injectable()
export class ClassicModeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger, private readonly classicModeService: ClassicModeService) {}

    @SubscribeMessage(ClassicModeEvents.Start)
    startGame(socket: Socket, userGame: UserGame) {
        const newRoomId = this.classicModeService.initNewRoom(socket, userGame, true);
        this.server.to(socket.id).emit(ClassicModeEvents.Started, newRoomId);
    }

    @SubscribeMessage(ClassicModeEvents.ValidateDifference)
    async validateDifference(socket: Socket, differencePos) {
        const validated = await this.classicModeService.validateDifference(socket.id, differencePos);
        this.server.to(socket.id).emit(ClassicModeEvents.DifferenceValidated, { validated, differencePos });
        if (this.classicModeService.isGameFinished(socket.id)) {
            this.endGame(socket);
        }
    }

    @SubscribeMessage(ClassicModeEvents.EndGame)
    endGame(socket: Socket) {
        this.server.to(socket.id).emit(ClassicModeEvents.GameFinished, this.classicModeService.gameRooms.get(socket.id).userGame.timer);
        this.server.emit(ClassicModeEvents.GameDeleted, this.classicModeService.gameRooms.get(socket.id).userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.CheckGame)
    checkGame(socket: Socket, gameName: string) {
        this.logger.log(`Check game: ${gameName}`);
        if (this.classicModeService.getGameRooms(gameName)) {
            this.logger.log('Game found');
            this.server.to(socket.id).emit(ClassicModeEvents.GameFound, gameName);
        }
    }

    @SubscribeMessage(ClassicModeEvents.CreateGame)
    createGame(socket: Socket, userGame: UserGame) {
        this.classicModeService.initNewRoom(socket, userGame, false);
        this.logger.log(`Create game: ${userGame.gameData.gameForm.name}`);
        this.server.emit(ClassicModeEvents.GameFound, userGame.gameData.gameForm.name);
    }

    @SubscribeMessage(ClassicModeEvents.CanJoinGame)
    canJoinGame(socket: Socket, userGame: [gameName: string, username: string]) {
        if (this.classicModeService.canJoinGame(socket, userGame[0], userGame[1])) {
            this.logger.log(`${userGame[1]} can join game: ${userGame[0]}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CanJoinGame);
        } else {
            this.logger.log(`${userGame[1]} cannot join game: ${userGame[0]}`);
            this.server.to(socket.id).emit(ClassicModeEvents.CannotJoinGame);
        }
    }

    @SubscribeMessage(ClassicModeEvents.JoinGame)
    joinGame(socket: Socket, userGame: [gameName: string, username: string]) {
        this.logger.log(`Join game: ${userGame[0]}`);
        if (this.classicModeService.joinGame(socket, userGame[0], userGame[1])) {
            this.logger.log(`${userGame[1]} joined game: ${userGame[0]}`);
            this.server.emit(ClassicModeEvents.GameInfo, this.classicModeService.getGameRooms(userGame[0]));
        } else {
            this.logger.log(`Game not found: ${userGame[0]}`);
            this.server.emit(ClassicModeEvents.GameInfo, undefined);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AbortGameCreation)
    abortGameCreation(socket: Socket, gameName: string) {
        this.logger.log(`Abort game creation: ${gameName}`);
        this.classicModeService.deleteRoom(socket.id);
        this.server.emit(ClassicModeEvents.GameDeleted, gameName);
        this.server.emit(ClassicModeEvents.GameCanceled, gameName);
    }

    @SubscribeMessage(ClassicModeEvents.LeaveGame)
    leaveGame(socket: Socket, playerInfo: [gameName: string, userName: string]) {
        this.logger.log(`${playerInfo[1]} leaving game: ${playerInfo[0]}`);
        const gameRoom = this.classicModeService.getGameRooms(playerInfo[0]);
        if (gameRoom) {
            gameRoom.userGame.potentielPlayers = gameRoom.userGame.potentielPlayers.filter((player) => player !== playerInfo[1]);
            this.classicModeService.gameRooms.set(gameRoom.roomId, gameRoom);
            this.server.emit(ClassicModeEvents.GameInfo, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.RejectPlayer)
    playerRejected(socket: Socket, playerInfo: [gameName: string, userName: string]) {
        const gameRoom = this.classicModeService.getGameRooms(playerInfo[0]);
        if (gameRoom) {
            this.logger.log(`${playerInfo[1]} rejected from game: ${playerInfo[0]}`);
            gameRoom.userGame.potentielPlayers = gameRoom.userGame.potentielPlayers.filter((player) => player !== playerInfo[1]);
            this.classicModeService.gameRooms.set(gameRoom.roomId, gameRoom);
            this.server.emit(ClassicModeEvents.PlayerRejected, gameRoom);
        }
    }

    @SubscribeMessage(ClassicModeEvents.AcceptPlayer)
    playerAccepted(socket: Socket, playerInfo: [gameName: string, userName: string]) {
        const gameRoom = this.classicModeService.getGameRooms(playerInfo[0]);
        if (gameRoom) {
            this.logger.log(`${playerInfo[1]} accepted from game: ${playerInfo[0]}`);
            gameRoom.userGame.potentielPlayers = [];
            gameRoom.userGame.username2 = playerInfo[1];
            gameRoom.started = true;
            this.classicModeService.gameRooms.set(gameRoom.roomId, gameRoom);
            this.server.emit(ClassicModeEvents.PlayerAccepted, gameRoom);
            this.server.emit(ClassicModeEvents.PlayerRejected, gameRoom);
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DelayBeforeEmmitingTime.DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        this.server.to(socket.id).emit(ClassicModeEvents.Waiting);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`${socket.id}: deconnexion`);
        this.classicModeService.deleteRoom(socket.id);
        if (this.classicModeService.gameRooms.get(socket.id)) {
            this.logger.log(`Game deleted: ${this.classicModeService.gameRooms.get(socket.id).userGame.gameData.gameForm.name}`);
            this.server.emit(ClassicModeEvents.GameDeleted, this.classicModeService.gameRooms.get(socket.id).userGame.gameData.gameForm.name);
        }
    }

    emitTime() {
        for (const gameRoom of this.classicModeService.gameRooms.values()) {
            this.classicModeService.updateTimer(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.Timer, this.classicModeService.gameRooms.get(gameRoom.roomId).userGame.timer);
        }
    }
}
