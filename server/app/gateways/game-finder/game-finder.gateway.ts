import { GameFinderEvents } from '@app/gateways/game-finder/game-finder.gateway.variables';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameFinderGateway {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger, private readonly gameModeService: GameModeService) {}

    @SubscribeMessage(GameFinderEvents.CheckGame)
    checkGame(socket: Socket, data: { gameName: string; gameMode: string }): void {
        if (this.gameModeService.getGameRoom(undefined, data.gameName, data.gameMode)) {
            this.logger.log(`Game finder gateway: Game ${data.gameName} found`);
            this.server.to(socket.id).emit(GameFinderEvents.GameFound, { gameName: data.gameName, gameMode: data.gameMode });
        }
    }

    @SubscribeMessage(GameFinderEvents.CanJoinGame)
    canJoinGame(socket: Socket, data: { gameName: string; username: string; gameMode: string }): void {
        if (this.gameModeService.canJoinGame(socket, data)) {
            this.logger.log(`Game finder gateway: ${data.username} can join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(GameFinderEvents.CanJoinGame);
        } else {
            this.logger.log(`Game finder gateway: ${data.username} cannot join the game: ${data.gameName}`);
            this.server.to(socket.id).emit(GameFinderEvents.CannotJoinGame);
        }
    }
}
