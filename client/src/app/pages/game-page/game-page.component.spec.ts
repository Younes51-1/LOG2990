/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// eslint-disable-next-line max-classes-per-file
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { GameScoreboardComponent } from '@app/components/game-scoreboard/game-scoreboard.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData, GameRoom } from '@app/interfaces/game';
import { Instruction } from '@app/interfaces/video-replay';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { GameService } from '@app/services/game/game.service';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { of, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

@NgModule({
    imports: [MatDialogModule, HttpClientModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}
class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('GamePageComponent', () => {
    let differenceMatrix: number[][];
    let gameData: GameData;
    let gameRoom: GameRoom;

    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let playAreaService: jasmine.SpyObj<PlayAreaService>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    const mockDialogRef = {
        afterClosed: () => of(true),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        close: () => {},
    };

    beforeEach(async () => {
        differenceMatrix = [[]];
        gameData = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulty: '', soloBestTimes: [], vsBestTimes: [], differenceMatrix };
        gameRoom = {
            userGame: { gameData, nbDifferenceFound: 0, timer: 0, username1: 'Test' },
            roomId: 'fakeId',
            started: false,
            gameMode: 'mode classique',
        };
        gameServiceSpy = jasmine.createSpyObj('GameService', [
            'timer$',
            'totalDifferencesFound$',
            'userDifferencesFound$',
            'gameFinished$',
            'gameRoom$',
            'getConstant',
            'gameConstants',
            'abandoned$',
            'serverValidateResponse$',
            'reset',
            'sendMessage',
            'changeTime',
            'endGame',
            'abandonGame',
            'disconnectSocket',
        ]);
        gameServiceSpy.timer$ = new Subject<number>();
        gameServiceSpy.totalDifferencesFound$ = new Subject<number>();
        gameServiceSpy.userDifferencesFound$ = new Subject<number>();
        gameServiceSpy.gameFinished$ = new Subject<boolean>();
        gameServiceSpy.gameRoom$ = new Subject<GameRoom>();
        gameServiceSpy.abandoned$ = new Subject<string>();
        gameServiceSpy.serverValidateResponse$ = new Subject<DifferenceTry>();
        gameServiceSpy.gameConstants = { initialTime: 10, penaltyTime: 10, bonusTime: 0 };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socketServiceMock as any).socket = socketHelper as unknown as Socket;
        playAreaService = jasmine.createSpyObj('PlayAreaService', [
            'cheatMode',
            'flashDifference',
            'errorAnswerVisuals',
            'createAndFillNewLayer',
            'handleImageLoad',
            'setContexts',
            'setComponent',
            'setSpeed',
            'setCheatMode',
            'correctAnswerVisuals',
            'clearAsync',
            'hintMode',
            'startConfetti',
        ]);
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, GameScoreboardComponent, MatToolbar, EndgameDialogComponent, ChatBoxComponent, PlayAreaComponent],
            imports: [DynamicTestModule, RouterTestingModule, MatDialogModule, HttpClientTestingModule],
            providers: [
                { provide: PlayAreaService, useValue: playAreaService },
                { provide: CommunicationSocketService, useValue: socketServiceMock },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        component.gameRoom = gameRoom;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain a scoreboard', () => {
        fixture.detectChanges();
        const sidebar = fixture.debugElement.nativeElement.querySelector('app-game-scoreboard');
        expect(sidebar).not.toBeNull();
    });

    it('should subscribe to timer$ observable', () => {
        const testingValue = 5;
        const spyTimer = spyOn(gameServiceSpy.timer$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.timer$.next(testingValue);
        expect(spyTimer).toHaveBeenCalled();
        expect(component.timer).toEqual(testingValue);
    });

    it('should subscribe to totalDifferencesFound $ observable', () => {
        const testingValue = 5;
        const spyDifferencesFound = spyOn(gameServiceSpy.totalDifferencesFound$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.totalDifferencesFound$.next(testingValue);
        expect(spyDifferencesFound).toHaveBeenCalled();
        expect(component.totalDifferencesFound).toEqual(testingValue);
    });

    it('should subscribe to userDifferencesFound$ observable', () => {
        const testingValue = 5;
        component.gameRoom.userGame.username2 = 'user2';
        (component as any).differenceThreshold = 5;
        const spyDifferencesFound = spyOn(gameServiceSpy.userDifferencesFound$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.userDifferencesFound$.next(testingValue);
        expect(spyDifferencesFound).toHaveBeenCalled();
        expect(component.userDifferencesFound).toEqual(testingValue);
        expect(gameServiceSpy.gameFinished$).toBeTruthy();
        expect(gameServiceSpy.endGame).toHaveBeenCalled();
    });

    it('should subscribe to gameFinished$ observable', fakeAsync(() => {
        const spyGameFinished = spyOn(gameServiceSpy.gameFinished$, 'subscribe').and.callThrough();
        const endGameSpy = spyOn(component, 'endGame');
        component.ngOnInit();
        gameServiceSpy.gameFinished$.next(true);
        expect(spyGameFinished).toHaveBeenCalled();
        tick();
        fixture.detectChanges();
        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should subscribe to gameRoom$ observable', () => {
        const spyUserGame = spyOn(gameServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.name);
        expect(component.username).toEqual(gameServiceSpy.username);
    });

    it('should subscribe to gameRoom$ observable and assign opponent username to username2', () => {
        gameServiceSpy.username = gameRoom.userGame.username1;
        gameRoom.userGame.username2 = 'username2';
        const spyUserGame = spyOn(gameServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.name);
        expect(component.username).toEqual(gameServiceSpy.username);
        expect(component.opponentUsername).toEqual(gameRoom.userGame.username2);
    });

    it('should subscribe to gameRoom$ observable and assign opponent username to username1', () => {
        gameRoom.userGame.username2 = 'username2';
        gameServiceSpy.username = gameRoom.userGame.username2;
        const spyUserGame = spyOn(gameServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.name);
        expect(component.username).toEqual(gameServiceSpy.username);
        expect(component.opponentUsername).toEqual(gameRoom.userGame.username1);
    });

    it('should assign the corresponding threshold from gameRoom$ observable for even differences number in multiplayer mode', () => {
        gameRoom.userGame.username2 = 'username2';
        gameRoom.userGame.gameData.nbDifference = 10;
        const spyUserGame = spyOn(gameServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.name);
        expect(component.username).toEqual(gameServiceSpy.username);
        expect((component as any).differenceThreshold).toEqual(gameRoom.userGame.gameData.nbDifference / 2);
    });

    it('should assign the corresponding threshold from gameRoom$ observable for odd differences number in multiplayer mode', () => {
        gameRoom.userGame.username2 = 'username2';
        gameRoom.userGame.gameData.nbDifference = 11;
        const spyUserGame = spyOn(gameServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.name);
        expect(component.username).toEqual(gameServiceSpy.username);
        expect((component as any).differenceThreshold).toEqual((gameRoom.userGame.gameData.nbDifference + 1) / 2);
    });

    it('should assign the corresponding threshold from gameRoom$ observable solo mode', () => {
        gameRoom.userGame.gameData.nbDifference = 11;
        const spyUserGame = spyOn(gameServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.name);
        expect(component.username).toEqual(gameServiceSpy.username);
        expect((component as any).differenceThreshold).toEqual(gameRoom.userGame.gameData.nbDifference);
    });

    it('should subscribe to abandoned$ observable', () => {
        const spyAbandonGame = spyOn(gameServiceSpy.abandoned$, 'subscribe').and.callThrough();
        component.ngOnInit();
        gameServiceSpy.abandoned$.next('test');
        expect(spyAbandonGame).toHaveBeenCalled();
    });

    it('should call startConfetti on abandoned$ observable in mode classique', () => {
        playAreaService.startConfetti.and.stub();
        const abandonGameSpy = spyOn(gameServiceSpy.abandoned$, 'subscribe').and.callThrough();
        gameServiceSpy.endGame.and.stub();
        const unsubscribeSpy = spyOn(component as any, 'unsubscribe').and.stub();
        (component as any).gameService.gameMode = 'mode classique';
        component.ngOnInit();
        gameServiceSpy.abandoned$.next('test');
        expect(abandonGameSpy).toHaveBeenCalled();
        expect(playAreaService.startConfetti).toHaveBeenCalled();
        expect(gameServiceSpy.endGame).toHaveBeenCalled();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should call getConstants and getConstantsFromServer', () => {
        gameServiceSpy.getConstant.and.stub();
        component.ngOnInit();
        expect(gameServiceSpy.getConstant).toHaveBeenCalled();
        expect(component.penaltyTime).toEqual(10);
    });

    it('should open EndgameDialogComponent with correct data if all differences found in single player mode and classic mode', () => {
        (component as any).gameFinished = true;
        gameServiceSpy.endGame.and.stub();
        component.totalDifferencesFound = component.gameRoom.userGame.gameData.nbDifference;
        const matDialogSpy = spyOn((component as any).dialog, 'open').and.callThrough();
        component.endGame();
        expect(matDialogSpy).toHaveBeenCalledWith(
            EndgameDialogComponent,
            jasmine.objectContaining({
                disableClose: true,
                data: jasmine.objectContaining({
                    gameFinished: true,
                    gameWinner: true,
                }),
            }),
        );
    });

    it('should open EndgameDialogComponent with correct data if in multiplayer mode and winner in classic mode', () => {
        (component as any).gameFinished = true;
        component.totalDifferencesFound = 0;
        component.gameRoom.userGame.username2 = 'test';
        gameServiceSpy.endGame.and.stub();
        component.userDifferencesFound = (component as any).differenceThreshold;
        const matDialogSpy = spyOn((component as any).dialog, 'open').and.callThrough();
        component.endGame();
        expect(matDialogSpy).toHaveBeenCalledWith(
            EndgameDialogComponent,
            jasmine.objectContaining({
                disableClose: true,
                data: jasmine.objectContaining({
                    gameFinished: true,
                    gameWinner: true,
                }),
            }),
        );
    });

    it('should open EndgameDialogComponent with correct data if in multiplayer mode and looser in classic mode', () => {
        (component as any).gameFinished = true;
        component.totalDifferencesFound = 0;
        gameServiceSpy.endGame.and.stub();
        component.gameRoom.userGame.gameData.nbDifference = 1;
        component.gameRoom.userGame.username2 = 'test';
        (component as any).differenceThreshold = 1;
        component.userDifferencesFound = 0;
        const matDialogSpy = spyOn((component as any).dialog, 'open').and.callThrough();
        component.endGame();
        expect(matDialogSpy).toHaveBeenCalledWith(
            EndgameDialogComponent,
            jasmine.objectContaining({
                disableClose: true,
                data: jasmine.objectContaining({
                    gameFinished: true,
                    gameWinner: false,
                }),
            }),
        );
    });

    it('endgame should call abandonConfirmation if game is not finished', () => {
        const abandonConfirmationSpy = spyOn(component as any, 'abandonConfirmation');
        component.endGame();
        expect(abandonConfirmationSpy).toHaveBeenCalled();
    });

    it('should open EndgameDialogComponent with correct data if all differences found in single player mode and limited time mode', () => {
        (component as any).gameFinished = true;
        gameServiceSpy.endGame.and.stub();
        component.totalDifferencesFound = component.gameRoom.userGame.gameData.nbDifference;
        const matDialogSpy = spyOn((component as any).dialog, 'open').and.callThrough();
        component.gameRoom.gameMode = 'limited-time-mode';
        component.endGame();
        expect(matDialogSpy).toHaveBeenCalledWith(
            EndgameDialogComponent,
            jasmine.objectContaining({
                disableClose: true,
                data: jasmine.objectContaining({
                    gameFinished: true,
                    gameWinner: true,
                    limitedTimeMode: true,
                }),
            }),
        );
    });

    it('endgame should call abandonConfirmation if game is not finished', () => {
        const abandonConfirmationSpy = spyOn(component as any, 'abandonConfirmation');
        component.gameRoom.gameMode = 'limited-time-mode';
        component.endGame();
        expect(abandonConfirmationSpy).toHaveBeenCalled();
    });

    it('should open EndgameDialogComponent and abandon game if abandon is true', fakeAsync(() => {
        spyOn((component as any).dialog, 'open').and.returnValue(mockDialogRef as MatDialogRef<EndgameDialogComponent>);
        spyOn((component as any).router, 'navigate');
        gameServiceSpy.abandonGame.and.stub();
        gameServiceSpy.disconnectSocket.and.stub();
        (component as any).abandonConfirmation();
        flush();
        expect((component as any).dialog.open).toHaveBeenCalled();
        expect(gameServiceSpy.abandonGame).toHaveBeenCalled();
        expect(gameServiceSpy.disconnectSocket).toHaveBeenCalled();
        expect((component as any).router.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should send error message in case of error', () => {
        component.username = gameRoom.userGame.username1;
        component.sendEvent('error');
        expect(gameServiceSpy.sendMessage).toHaveBeenCalledWith(`Erreur par ${component.username}`, 'Système');
    });

    it('should send success message in case of success', () => {
        component.username = gameRoom.userGame.username1;
        component.sendEvent('success');
        expect(gameServiceSpy.sendMessage).toHaveBeenCalledWith(`Différence trouvée par ${component.username}`, 'Système');
    });

    it('should send abandon message in case of abandon', () => {
        component.username = gameRoom.userGame.username1;
        component.sendEvent('abandon');
        expect(gameServiceSpy.sendMessage).toHaveBeenCalledWith(`${component.username} a abandonné la partie`, 'Système');
    });

    it('should send hint message in case of hint', () => {
        component.sendEvent('hint');
        expect(gameServiceSpy.sendMessage).toHaveBeenCalledWith('Indice utilisé', 'Système');
    });

    it('should have a button to quit the game', fakeAsync(() => {
        const quitBtn = fixture.debugElement.nativeElement.getElementsByTagName('button')[1];
        const endGameSpy = spyOn(component, 'endGame');
        quitBtn.click();
        tick();
        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should unsubscribe from all subscriptions on unsubscribe', () => {
        spyOn((component as any).timerSubscription, 'unsubscribe');
        spyOn((component as any).differencesFoundSubscription, 'unsubscribe');
        spyOn((component as any).userDifferencesFoundSubscription, 'unsubscribe');
        spyOn((component as any).gameFinishedSubscription, 'unsubscribe');
        spyOn((component as any).gameRoomSubscription, 'unsubscribe');
        spyOn((component as any).abandonedGameSubscription, 'unsubscribe');
        (component as any).unsubscribe();
        expect((component as any).timerSubscription.unsubscribe).toHaveBeenCalled();
        expect((component as any).differencesFoundSubscription.unsubscribe).toHaveBeenCalled();
        expect((component as any).userDifferencesFoundSubscription.unsubscribe).toHaveBeenCalled();
        expect((component as any).gameFinishedSubscription.unsubscribe).toHaveBeenCalled();
        expect((component as any).gameRoomSubscription.unsubscribe).toHaveBeenCalled();
        expect((component as any).abandonedGameSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('toggleHint should call hintMode, sendEvent and changeTime with penaltyTime in classic mode', () => {
        (component as any).gameService.gameConstants = { initialTime: 100, penaltyTime: 10, bonusTime: 5 };
        const sendEventSpy = spyOn(component as any, 'sendEvent').and.stub();
        component.toggleHint();
        expect(gameServiceSpy.changeTime).toHaveBeenCalledWith(10);
        expect(playAreaService.hintMode).toHaveBeenCalled();
        expect(sendEventSpy).toHaveBeenCalled();
    });

    it('toggleHint should call hintMode, sendEvent and changeTime with penaltyTime in limited mode', () => {
        (component as any).gameService.gameConstants = { initialTime: 100, penaltyTime: 10, bonusTime: 5 };
        const sendEventSpy = spyOn(component as any, 'sendEvent').and.stub();
        (component as any).gameService.gameMode = 'limited-time-mode';
        component.toggleHint();
        expect(gameServiceSpy.changeTime).toHaveBeenCalledWith(-10);
        expect(playAreaService.hintMode).toHaveBeenCalled();
        expect(sendEventSpy).toHaveBeenCalled();
    });

    it('getImage should change url of original if first is true', () => {
        component.getImage({ src: 'original', first: true });
        expect(component.videoReplay.images.original).toEqual('original');
    });

    it('getImage should change url of modified if first is false', () => {
        component.getImage({ src: 'modified', first: false });
        expect(component.videoReplay.images.modified).toEqual('modified');
    });

    it('getDiff should push diff to actions', () => {
        component.getDiff({ diff: [[]] });
        expect(component.videoReplay.actions).toEqual([{ type: Instruction.DiffFound, timeStart: component.timer, difference: [[]] }]);
    });

    it('getError should push error to actions', () => {
        component.getError({ pos: { x: 1, y: 1 }, leftCanvas: true });
        expect(component.videoReplay.actions).toEqual([
            { type: Instruction.Error, timeStart: component.timer, mousePosition: { x: 1, y: 1 }, leftCanvas: true },
        ]);
    });

    it('getSource should push src to sources, and cheat layers', () => {
        const layer = document.createElement('canvas');
        component.getSource({ src: 'test', layer });
        expect(component.videoReplay.sources).toEqual(['test']);
        expect(component.videoReplay.cheatLayers).toEqual([layer]);
    });

    it('getCheatStart should push layer to actions', () => {
        const layer = document.createElement('canvas');
        component.getCheatStart({ layer });
        expect(component.videoReplay.actions).toEqual([{ type: Instruction.CheatModeStart, timeStart: component.timer, cheatLayer: layer }]);
    });

    it('getCheatEnd should push cheat end to actions', () => {
        component.getCheatEnd();
        expect(component.videoReplay.actions).toEqual([{ type: Instruction.CheatModeEnd, timeStart: component.timer }]);
    });

    it('getChatMessage should push diff to actions', () => {
        const message = { message: 'test', username: 'test', roomId: 'test' };
        component.getChatMessage(message);
        expect(component.videoReplay.actions).toEqual([{ type: Instruction.ChatMessage, timeStart: component.timer, message }]);
    });

    it('getDifferencesFound should push score to actions', () => {
        component.username = 'test';
        component.getDifferencesFound(10);
        expect(component.videoReplay.actions).toEqual([{ type: Instruction.Score, timeStart: component.timer, nbDifferences: 10, username: 'test' }]);
    });

    it('getOpponentDifferencesFound should push score to actions', () => {
        component.opponentUsername = 'test';
        component.getOpponentDifferencesFound(10);
        expect(component.videoReplay.actions).toEqual([{ type: Instruction.Score, timeStart: component.timer, nbDifferences: 10, username: 'test' }]);
    });

    it('getHint should push score to actions', () => {
        const layer = document.createElement('canvas');
        component.getHint({ hintNum: 1, diffPos: { x: 1, y: 1 }, layer });
        expect(component.videoReplay.actions).toEqual([
            {
                type: Instruction.Hint,
                timeStart: component.timer,
                mousePosition: { x: 1, y: 1 },
                nbDifferences: 1,
                cheatLayer: layer,
            },
        ]);
    });

    it('should reset and clearAsync on ngOnDestroy', () => {
        gameServiceSpy.reset.and.stub();
        playAreaService.clearAsync.and.stub();
        const closeAllSpy = spyOn((component as any).dialog, 'closeAll').and.stub();
        component.ngOnDestroy();
        expect(closeAllSpy).toHaveBeenCalled();
        expect(gameServiceSpy.reset).toHaveBeenCalled();
        expect(playAreaService.clearAsync).toHaveBeenCalled();
    });
});
