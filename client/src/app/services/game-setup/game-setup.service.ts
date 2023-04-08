import { Injectable } from '@angular/core';
import { GameData, GameRoom } from '@app/interfaces/game';
import { GameConstants } from '@app/interfaces/game-constants';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';

@Injectable({
    providedIn: 'root',
})
export class GameSetupService {
    username: string;
    gameRoom: GameRoom;
    gameConstans: GameConstants;
    gameMode: string;
    gameRoom$ = new Subject<GameRoom>();
    private slides: GameData[] = [];

    // need all services to be injected in the constructor
    // eslint-disable-next-line max-params
    constructor(
        private communicationService: CommunicationHttpService,
        private configHttpService: ConfigHttpService,
        private waitingRoomService: WaitingRoomService,
        private router: Router,
    ) {
        this.getAllGames();
        this.getConstant();
    }

    getConstant(): void {
        this.configHttpService.getConstants().subscribe((res) => {
            this.gameConstans = res;
        });
    }

    getAllGames() {
        this.communicationService.getAllGames().subscribe((games) => {
            for (const game of games) {
                this.communicationService.getGame(game.name).subscribe((res) => {
                    if (res) this.slides.push(res);
                });
            }
        });
    }

    initGameRoom(username: string, started: boolean, gameMode: string): void {
        this.gameRoom = {
            userGame: {
                gameData: undefined as unknown as GameData,
                nbDifferenceFound: 0,
                timer: this.gameConstans.initialTime,
                username1: username,
            },
            roomId: '',
            started,
            gameMode,
        };
        this.username = username;
        this.gameMode = gameMode;
    }

    initGameMode(gameName: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (res && Object.keys(res).length !== 0) {
                this.gameRoom.userGame.gameData = res;
                this.waitingRoomService.createGame(this.gameRoom);
                if (this.gameRoom.started) {
                    this.router.navigate(['/game']);
                }
            } else {
                alert('Jeu introuvable');
            }
        });
    }

    joinGame(gameName: string, username: string): void {
        this.communicationService.getGame(gameName).subscribe((res) => {
            if (res && Object.keys(res).length !== 0) {
                this.gameRoom = undefined as unknown as GameRoom;
                this.waitingRoomService.joinGame(gameName, username);
            } else {
                alert('Jeu introuvable');
            }
        });
    }
}
