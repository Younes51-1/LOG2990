import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BestTime, GameData } from '@app/interfaces/game';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { of } from 'rxjs';
import { GameSetupService } from './game-setup.service';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

describe('GameSetupService', () => {
    let differenceMatrix: number[][];
    let gameData: GameData;
    let newBestTimes: BestTime[];

    let service: GameSetupService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationHttpService>;
    let configHttpServiceSpy: jasmine.SpyObj<ConfigHttpService>;
    let waitingRoomServiceSpy: jasmine.SpyObj<WaitingRoomService>;
    let zone: NgZone;

    beforeEach(() => {
        differenceMatrix = [[]];
        gameData = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulty: '', soloBestTimes: [], vsBestTimes: [], differenceMatrix };
        newBestTimes = [
            { name: 'Player 1', time: 60 },
            { name: 'Player 2', time: 120 },
            { name: 'Player 3', time: 180 },
        ];
        zone = new NgZone({ enableLongStackTrace: false });
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getAllGames', 'getGame']);
        communicationServiceSpy.getAllGames.and.returnValue(of([gameData]));
        communicationServiceSpy.getGame.and.returnValue(of(gameData));
        configHttpServiceSpy = jasmine.createSpyObj('ConfigHttpService', ['getConstants', 'getBestTime', 'updateBestTime']);
        configHttpServiceSpy.getConstants.and.returnValue(of({ initialTime: 10, bonusTime: 2, penaltyTime: 0 }));
        configHttpServiceSpy.getBestTime.and.returnValue(of({ soloBestTimes: newBestTimes, vsBestTimes: newBestTimes }));
        waitingRoomServiceSpy = jasmine.createSpyObj('WaitingRoomService', ['createGame', 'joinGame']);
        waitingRoomServiceSpy.createGame.and.stub();
        waitingRoomServiceSpy.joinGame.and.stub();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, AppRoutingModule, DynamicTestModule],
            providers: [
                { provide: WaitingRoomService, useValue: waitingRoomServiceSpy },
                { provide: ConfigHttpService, useValue: configHttpServiceSpy },
                { provide: CommunicationHttpService, useValue: communicationServiceSpy },
            ],
        });
        service = TestBed.inject(GameSetupService);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).slides = [gameData];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getConstant should call getConstant by configHttpService', () => {
        service.getConstant();
        expect(configHttpServiceSpy.getConstants).toHaveBeenCalled();
        expect(service.gameConstants).toEqual({ initialTime: 10, bonusTime: 2, penaltyTime: 0 });
    });

    it('should setConstants', () => {
        service.setConstants({ initialTime: 10, bonusTime: 2, penaltyTime: 0 });
        expect(service.gameConstants).toEqual({ initialTime: 10, bonusTime: 2, penaltyTime: 0 });
    });

    it('should getAllGames', () => {
        expect(communicationServiceSpy.getAllGames).toHaveBeenCalled();
        expect(service.getSlides()).toEqual([gameData]);
    });

    it('should getSlides', () => {
        expect(service.getSlides()).toEqual([gameData]);
    });

    it('should initGameRoom', () => {
        service.gameMode = 'mode classique';
        service.initGameRoom('Player 1', false);
        expect(service.gameRoom).toEqual({
            userGame: {
                gameData: undefined as unknown as GameData,
                nbDifferenceFound: 0,
                timer: 0,
                username1: 'Player 1',
            },
            roomId: '',
            started: false,
            gameMode: 'mode classique',
        });
        expect(service.username).toEqual('Player 1');
    });

    it('should call initClassicMode when gameMode is mode classique', () => {
        spyOn(service, 'initClassicMode').and.stub();
        service.initGameMode('game1');
        expect(service.initClassicMode).toHaveBeenCalled();
        expect(communicationServiceSpy.getGame).toHaveBeenCalled();
    });

    it('should call initLimitedTimeMode when gameMode is limited-time-mode', () => {
        spyOn(service, 'initLimitedTimeMode').and.stub();
        service.initGameMode();
        expect(service.initLimitedTimeMode).toHaveBeenCalled();
        expect(communicationServiceSpy.getGame).toHaveBeenCalled();
    });

    it('should initClassicMode', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).slides = [gameData];
        service.initGameRoom('Player 1', false);
        service.initClassicMode('');
        expect(service.gameRoom.userGame.gameData).toEqual(gameData);
        expect(waitingRoomServiceSpy.createGame).toHaveBeenCalled();
    });

    it('should initClassicMode and call createGame by waiting room service', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).slides = [gameData];
        service.initGameRoom('Player 1', true);
        zone.run(() => {
            service.initClassicMode('');
        });
        expect(service.gameRoom.userGame.gameData).toEqual(gameData);
        expect(waitingRoomServiceSpy.createGame).toHaveBeenCalled();
    });

    it('should alert if gameName is not found', () => {
        spyOn(window, 'alert').and.stub();
        service.initClassicMode('game2');
        expect(window.alert).toHaveBeenCalledWith('Jeu introuvable');
    });

    it('should initLimitedTimeMode', () => {
        service.initGameRoom('Player 1', false);
        service.initLimitedTimeMode();
        expect(service.gameRoom.userGame.gameData).toEqual(gameData);
        expect(waitingRoomServiceSpy.createGame).toHaveBeenCalled();
    });

    it('should initLimitedTimeMode and call createGame by waiting room service', () => {
        service.initGameRoom('Player 1', true);
        zone.run(() => {
            service.initLimitedTimeMode();
        });
        expect(service.gameRoom.userGame.gameData).toEqual(gameData);
        expect(waitingRoomServiceSpy.createGame).toHaveBeenCalled();
    });

    it('should call joinClassicMode when gameMode is mode classique', () => {
        spyOn(service, 'joinClassicMode').and.stub();
        service.gameMode = 'mode classique';
        service.joinGame('username', 'gameName');
        expect(service.joinClassicMode).toHaveBeenCalled();
    });

    it('should call joinLimitedTimeMode when gameMode is limited-time-mode', () => {
        spyOn(service, 'joinLimitedTimeMode').and.stub();
        service.gameMode = 'limited-time-mode';
        service.joinGame('username');
        expect(service.joinLimitedTimeMode).toHaveBeenCalled();
    });

    it('should joinClassicMode', () => {
        service.joinClassicMode('');
        expect(waitingRoomServiceSpy.joinGame).toHaveBeenCalled();
    });

    it('should alert if gameName is not found', () => {
        spyOn(window, 'alert').and.stub();
        service.joinClassicMode('game2');
        expect(window.alert).toHaveBeenCalledWith('Jeu introuvable');
    });

    it('should joinLimitedTimeMode', () => {
        service.joinLimitedTimeMode();
        expect(waitingRoomServiceSpy.joinGame).toHaveBeenCalled();
    });

    it('should return a randomSlide', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const randomSlide = (service as any).randomSlide();
        expect(randomSlide).toEqual(gameData);
    });

    it('should return a getGameData', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const slide = (service as any).getGameData('');
        expect(slide).toEqual(gameData);
    });
});
