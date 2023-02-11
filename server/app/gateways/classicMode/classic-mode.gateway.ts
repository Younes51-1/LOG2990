import { UserGame } from '@app/model/schema/user-game.schema';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME } from './classic-mode.gateway.constants';
import { ClassicModeEvents } from './classic-mode.gateway.events';

enum Times {
    MinInSec = 60,
    SecInMil = 1000,
    TenSec = 10,
}

@WebSocketGateway({ cors: true })
@Injectable()
export class ClassicModeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger, private readonly classicModeService: ClassicModeService) {}

    @SubscribeMessage(ClassicModeEvents.Start)
    startGame(socket: Socket, userGame: UserGame) {
        const newRoomId = this.classicModeService.initNewRoom(socket, userGame);
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
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        this.server.to(socket.id).emit(ClassicModeEvents.Waiting);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`${socket.id}: deconnexion`);
        this.classicModeService.deleteRoom(socket.id);
    }

    private emitTime() {
        for (const gameRoom of this.classicModeService.gameRooms.values()) {
            this.classicModeService.updateTimer(gameRoom);
            this.server.to(gameRoom.roomId).emit(ClassicModeEvents.Timer, this.classicModeService.gameRooms.get(gameRoom.roomId).userGame.timer);
        }
    }
}
