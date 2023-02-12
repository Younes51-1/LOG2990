import { Injectable } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameRoom } from '@app/interfaces/game-room';
import { UserGame } from '@app/interfaces/user-game';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClassicModeService {
    gameRoom: GameRoom;
    canSendValidate = true;
    differencesFound$ = new Subject<number>();
    timer$ = new Subject<number>();
    gameFinished$ = new Subject<boolean>();
    userGame$ = new Subject<UserGame>();
    serverValidateResponse$ = new Subject<boolean>();

    constructor(private readonly socketService: CommunicationSocketService, private communicationService: CommunicationService) {}

    initClassicMode(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.gameRoom = {
                    userGame: {
                        gameData: res,
                        nbDifferenceFound: 0,
                        timer: 0,
                        username,
                    },
                    roomId: '',
                };
                this.userGame$.next(this.gameRoom.userGame);
                this.connect();
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    connect(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.handleSocket();
        } else {
            alert('Un problème est survenu lors de la connexion au serveur');
        }
    }

    handleSocket(): void {
        this.socketService.on('waiting', () => {
            this.startGame();
        });

        this.socketService.on('started', (roomId: string) => {
            this.gameRoom.roomId = roomId;
        });

        this.socketService.on('validated', (differenceTry: DifferenceTry) => {
            if (differenceTry.validated) {
                this.gameRoom.userGame.nbDifferenceFound++;
                this.differencesFound$.next(this.gameRoom.userGame.nbDifferenceFound);
            }
            this.serverValidateResponse$.next(differenceTry.validated);
        });

        this.socketService.on('GameFinished', (timer: number) => {
            this.gameRoom.userGame.timer = timer;
            this.gameFinished$.next(true);
            this.socketService.disconnect();
        });

        this.socketService.on('timer', (timer: number) => {
            this.gameRoom.userGame.timer = timer;
            this.timer$.next(timer);
            this.canSendValidate = true;
        });
    }

    startGame(): void {
        this.socketService.send('start', this.gameRoom.userGame);
    }

    validateDifference(differencePos: Vec2) {
        if (!this.canSendValidate) {
            return;
        }
        this.socketService.send('validate', differencePos);
        this.canSendValidate = false;
    }

    endGame(): void {
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('endGame');
        }
    }
}
