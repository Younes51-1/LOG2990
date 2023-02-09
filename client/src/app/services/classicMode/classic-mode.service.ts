import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { Timer } from '@app/interfaces/timer';
import { UserGame } from '@app/interfaces/user-game';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communication.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';

@Injectable({
    providedIn: 'root',
})
export class ClassicModeService {
    userGame: UserGame;
    canSendValidate = true;
    differencesFound: Vec2[] = [];

    constructor(private readonly socketService: CommunicationSocketService, private communicationService: CommunicationService) {}

    initClassicMode(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.userGame = {
                    gameData: res,
                    nbDifferenceToFind: res.gameForm.nbDifference,
                    timer: { minutes: 0, seconds: 0, intervalId: 0 },
                    username,
                };
                this.connect();
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    connect(): void {
        if (!this.socketService.isSocketAlive()) {
            // eslint-disable-next-line no-console
            console.log('socket not connected, connecting...');
            this.socketService.connect();
            this.handleSocket();
        } else {
            // eslint-disable-next-line no-console
            console.log('socket already connected');
        }
    }

    handleSocket(): void {
        this.socketService.on('waiting', () => {
            this.startGame();
        });

        this.socketService.on('started', () => {
            // TODO: handle start
        });

        this.socketService.on('validated', (differenceTry: DifferenceTry) => {
            if (differenceTry.validated) {
                this.userGame.nbDifferenceToFind--;
                this.differencesFound.push(differenceTry.differencePos);
            }
            // TODO: handle validated for differencePos
        });

        this.socketService.on('GameFinished', (timer: Timer) => {
            this.userGame.timer = timer;
            this.socketService.disconnect();
        });

        this.socketService.on('timer', (timer: Timer) => {
            this.userGame.timer = timer;
            this.canSendValidate = true;
        });
    }

    startGame(): void {
        this.socketService.send('connection', this.userGame.username);
        this.socketService.send('start', this.userGame);
    }

    validateDifference(differencePos: Vec2) {
        if (!this.canSendValidate) {
            return;
        }
        this.socketService.send('validate', differencePos);
        this.canSendValidate = false;
    }

    quitGame(): void {
        this.socketService.send('endGame');
    }
}
