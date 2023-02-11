import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ClassicModeEvents } from './classic-mode.gateway.events';

enum Times {
    MinInSec = 60,
    SecInMil = 1000,
    TenSec = 10,
}

@WebSocketGateway({ cors: true })
@Injectable()
export class ClassicModeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly logger: Logger, private readonly classicModeService: ClassicModeService) {}

    @SubscribeMessage(ClassicModeEvents.Start)
    startGame(socket: Socket, userGame: UserGame) {
        this.classicModeService.initClassicMode(userGame);
        this.classicModeService.userGame.timer.intervalId = window.setInterval(() => {
            this.classicModeService.userGame.timer.seconds++;
            if (this.classicModeService.userGame.timer.seconds === Times.MinInSec) {
                this.classicModeService.userGame.timer.seconds = 0;
                this.classicModeService.userGame.timer.minutes++;
            }
        }, Times.SecInMil);
        socket.emit(ClassicModeEvents.Started);
        this.emitTime(socket);
    }

    @SubscribeMessage(ClassicModeEvents.ValidateDifference)
    async validateDifference(socket: Socket, differencePos: Vector2D) {
        const validated = await this.classicModeService.validateDifference(differencePos);
        socket.emit(ClassicModeEvents.DifferenceValidated, { validated, differencePos });
        if (this.classicModeService.isGameFinished()) {
            this.endGame(socket);
        }
    }

    @SubscribeMessage(ClassicModeEvents.EndGame)
    endGame(socket: Socket) {
        clearInterval(this.classicModeService.userGame.timer.intervalId);
        socket.emit(ClassicModeEvents.GameFinished, this.classicModeService.userGame.timer);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        socket.emit(ClassicModeEvents.Waiting);
    }

    handleDisconnect(socket: Socket) {
        clearInterval(this.classicModeService.userGame.timer.intervalId);
        this.logger.log(`${socket.id}: deconnexion`);
    }

    private emitTime(socket: Socket) {
        socket.emit(ClassicModeEvents.Timer, this.classicModeService.userGame.timer);
    }
}
