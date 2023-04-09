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
            this.slides = games;
        });
    }

    getSlides(): GameData[] {
        return this.slides;
    }

    initGameRoom(username: string, started: boolean): void {
        this.gameRoom = {
            userGame: {
                gameData: undefined as unknown as GameData,
                nbDifferenceFound: 0,
                timer: 0,
                username1: username,
            },
            roomId: '',
            started,
            gameMode: this.gameMode,
        };
        this.username = username;
    }

    initGameMode(gameName = undefined as unknown as string): void {
        if (gameName) {
            this.initClassicMode(gameName);
        } else {
            this.initLimitedTimeMode();
        }
    }

    initClassicMode(gameName: string): void {
        const slide = this.getGameData(gameName);
        if (!slide) {
            alert('Jeu introuvable');
            return;
        }
        this.gameRoom.userGame.gameData = slide;
        this.waitingRoomService.createGame(this.gameRoom);
        if (this.gameRoom.started) {
            this.router.navigate(['/game']);
        }
    }

    initLimitedTimeMode(): void {
        this.gameRoom.userGame.gameData = this.randomSlide();
        this.gameRoom.userGame.timer = this.gameConstans.initialTime;
        this.waitingRoomService.createGame(this.gameRoom);
        if (this.gameRoom.started) {
            this.router.navigate(['/game']);
        }
    }

    joinGame(username: string, gameName = undefined as unknown as string): void {
        this.username = username;
        if (this.gameMode === 'classic-mode') {
            this.joinClassicMode(gameName);
        } else {
            this.joinLimitedTimeMode();
        }
    }

    joinClassicMode(gameName: string): void {
        const slide = this.getGameData(gameName);
        if (!slide) {
            alert('Jeu introuvable');
            return;
        }
        this.waitingRoomService.joinGame(this.username, this.gameMode, gameName);
    }

    joinLimitedTimeMode(): void {
        this.waitingRoomService.joinGame(this.username, this.gameMode);
    }

    private randomSlide(): GameData {
        return this.slides[Math.floor(Math.random() * this.slides.length)];
    }

    private getGameData(gameName: string): GameData | undefined {
        return this.slides.find((game) => game.name === gameName);
    }
}
