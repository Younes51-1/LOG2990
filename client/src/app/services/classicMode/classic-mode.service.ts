import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData } from '@app/interfaces/game-data';
import { Timer } from '@app/interfaces/timer';
import { UserGame } from '@app/interfaces/user-game';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';

@Injectable({
    providedIn: 'root',
})
export class ClassicModeService {
    userGame: UserGame;
    canSendValidate = true;
    differencesFound: Vec2[] = [];

    constructor(private readonly socket: CommunicationSocketService) {}

    initClassicMode(gameData: GameData): void {
        this.userGame.gameData = gameData;
        this.userGame.nbDifferenceToFind = gameData.gameForm.nbDifference;
        this.userGame.timer = { minutes: 0, seconds: 0, intervalId: 0 };
    }

    connect(): void {
        this.socket.connect();
    }

    handleSocket(): void {
        this.socket.on('waiting', () => {
            this.startGame();
        });

        this.socket.on('started', () => {
            // TODO: handle start
        });

        this.socket.on('validated', (differenceTry: DifferenceTry) => {
            if (differenceTry.validated) {
                this.userGame.nbDifferenceToFind--;
                this.differencesFound.push(differenceTry.differencePos);
            }
            // TODO: handle validated for differencePos
        });

        this.socket.on('GameFinished', (timer: Timer) => {
            this.userGame.timer = timer;
            this.socket.disconnect();
        });

        this.socket.on('timer', (timer: Timer) => {
            this.userGame.timer = timer;
            this.canSendValidate = true;
        });
    }

    startGame(): void {
        this.socket.send('start', this.userGame);
    }

    validateDifference(differencePos: Vec2) {
        if (!this.canSendValidate) {
            return;
        }
        this.socket.send('validate', differencePos);
        this.canSendValidate = false;
    }

    quitGame(): void {
        this.socket.send('endGame');
    }
}
