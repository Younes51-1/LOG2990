/* eslint-disable @typescript-eslint/no-magic-numbers */
// eslint-disable-next-line max-classes-per-file
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameScoreboardComponent } from '@app/components/game-scoreboard/game-scoreboard.component';
import { GameData, GameRoom } from '@app/interfaces/game';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ChatService } from '@app/services/chat/chat.service';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import SpyObj = jasmine.SpyObj;

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
    let gameForm;
    let gameData: GameData;
    let gameRoom: GameRoom;

    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationHttpService>;
    let classicModeServiceSpy: ClassicModeService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let chatServiceSpy: ChatService;
    const mockDialogRef = {
        afterClosed: () => of(true),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        close: () => {},
    };

    beforeEach(async () => {
        differenceMatrix = [[]];
        gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
        gameData = { gameForm, differenceMatrix };
        gameRoom = { userGame: { gameData, nbDifferenceFound: 0, timer: 0, username1: 'Test' }, roomId: 'fakeId', started: false };
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGame']);
        communicationServiceSpy.getGame.and.returnValue(of(gameData));
        classicModeServiceSpy = jasmine.createSpyObj('ClassicModeService', ['timer$', 'differencesFound$', 'gameFinished$', 'userGame$']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        chatServiceSpy = new ChatService(socketServiceMock);
        spyOn(chatServiceSpy, 'sendMessage').and.callFake(() => {
            return;
        });
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, GameScoreboardComponent, MatToolbar, EndgameDialogComponent, ChatBoxComponent, PlayAreaComponent],
            imports: [DynamicTestModule, RouterTestingModule, MatDialogModule],
            providers: [
                ChatService,
                ClassicModeService,
                CommunicationSocketService,
                CommunicationHttpService,
                { provide: CommunicationSocketService, useValue: socketServiceMock },
                { provide: ChatService, useValue: chatServiceSpy },
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

    it('should contain a sidebar', () => {
        fixture.detectChanges();
        const sidebar = fixture.debugElement.nativeElement.querySelector('app-game-scoreboard');
        expect(sidebar).not.toBeNull();
    });

    it('should subscribe to timer$ observable', () => {
        const testingValue = 5;
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyTimer = spyOn(classicModeServiceSpy.timer$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.timer$.next(testingValue);
        expect(spyTimer).toHaveBeenCalled();
        expect(component.timer).toEqual(testingValue);
    });

    it('should subscribe to totalDifferencesFound $ observable', () => {
        const testingValue = 5;
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyDifferencesFound = spyOn(classicModeServiceSpy.totalDifferencesFound$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.totalDifferencesFound$.next(testingValue);
        expect(spyDifferencesFound).toHaveBeenCalled();
        expect(component.totalDifferencesFound).toEqual(testingValue);
    });

    it('should subscribe to userDifferencesFound$ observable', () => {
        const testingValue = 5;
        component.gameRoom.userGame.username2 = 'user2';
        component.differenceThreshold = 5;
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyDifferencesFound = spyOn(classicModeServiceSpy.userDifferencesFound$, 'subscribe').and.callThrough();
        const endGameSpy = spyOn(classicModeServiceSpy, 'endGame');
        component.ngOnInit();
        classicModeServiceSpy.userDifferencesFound$.next(testingValue);
        expect(spyDifferencesFound).toHaveBeenCalled();
        expect(component.userDifferencesFound).toEqual(testingValue);
        expect(classicModeServiceSpy.gameFinished$).toBeTruthy();
        expect(endGameSpy).toHaveBeenCalled();
    });

    it('should subscribe to gameFinished$ observable', fakeAsync(() => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyGameFinished = spyOn(classicModeServiceSpy.gameFinished$, 'subscribe').and.callThrough();
        const endGameSpy = spyOn(component, 'endGame');
        component.ngOnInit();
        classicModeServiceSpy.gameFinished$.next(true);
        expect(spyGameFinished).toHaveBeenCalled();
        tick();
        fixture.detectChanges();
        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should subscribe to gameRoom$ observable', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyUserGame = spyOn(classicModeServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.gameForm.name);
        expect(component.username).toEqual(classicModeServiceSpy.username);
    });

    it('should subscribe to gameRoom$ observable and assign opponent username to username2', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        classicModeServiceSpy.username = gameRoom.userGame.username1;
        gameRoom.userGame.username2 = 'username2';
        const spyUserGame = spyOn(classicModeServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.gameForm.name);
        expect(component.username).toEqual(classicModeServiceSpy.username);
        expect(component.opponentUsername).toEqual(gameRoom.userGame.username2);
    });

    it('should subscribe to gameRoom$ observable and assign opponent username to username1', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        gameRoom.userGame.username2 = 'username2';
        classicModeServiceSpy.username = gameRoom.userGame.username2;
        const spyUserGame = spyOn(classicModeServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.gameForm.name);
        expect(component.username).toEqual(classicModeServiceSpy.username);
        expect(component.opponentUsername).toEqual(gameRoom.userGame.username1);
    });

    it('should assign the corresponding threshold from gameRoom$ observable for even differences number in multiplayer mode', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        gameRoom.userGame.username2 = 'username2';
        gameRoom.userGame.gameData.gameForm.nbDifference = 10;
        const spyUserGame = spyOn(classicModeServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.gameForm.name);
        expect(component.username).toEqual(classicModeServiceSpy.username);
        expect(component.differenceThreshold).toEqual(gameRoom.userGame.gameData.gameForm.nbDifference / 2);
    });

    it('should assign the corresponding threshold from gameRoom$ observable for odd differences number in multiplayer mode', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        gameRoom.userGame.username2 = 'username2';
        gameRoom.userGame.gameData.gameForm.nbDifference = 11;
        const spyUserGame = spyOn(classicModeServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.gameForm.name);
        expect(component.username).toEqual(classicModeServiceSpy.username);
        expect(component.differenceThreshold).toEqual((gameRoom.userGame.gameData.gameForm.nbDifference + 1) / 2);
    });

    it('should assign the corresponding threshold from gameRoom$ observable solo mode', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        gameRoom.userGame.gameData.gameForm.nbDifference = 11;
        const spyUserGame = spyOn(classicModeServiceSpy.gameRoom$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.gameRoom$.next(gameRoom);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.gameRoom).toEqual(gameRoom);
        expect(component.gameName).toEqual(gameRoom.userGame.gameData.gameForm.name);
        expect(component.username).toEqual(classicModeServiceSpy.username);
        expect(component.differenceThreshold).toEqual(gameRoom.userGame.gameData.gameForm.nbDifference);
    });

    it('should subscribe to abandoned$ observable', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyAbandonGame = spyOn(classicModeServiceSpy.abandoned$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.abandoned$.next('test');
        expect(spyAbandonGame).toHaveBeenCalled();
    });

    it('should open EndgameDialogComponent with correct data if all differences found in single player mode', () => {
        component.gameFinished = true;
        component.totalDifferencesFound = component.gameRoom.userGame.gameData.gameForm.nbDifference;
        const matDialogSpy = spyOn(component.dialog, 'open').and.callThrough();
        component.endGame();
        expect(matDialogSpy).toHaveBeenCalledWith(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: true } });
    });

    it('should open EndgameDialogComponent with correct data if in multiplayer mode and winner', () => {
        component.gameFinished = true;
        component.totalDifferencesFound = 0;
        component.gameRoom.userGame.username2 = 'test';
        component.userDifferencesFound = component.differenceThreshold;
        const matDialogSpy = spyOn(component.dialog, 'open').and.callThrough();
        component.endGame();
        expect(matDialogSpy).toHaveBeenCalledWith(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: true } });
    });

    it('should open EndgameDialogComponent with correct data if in multiplayer mode and looser', () => {
        component.gameFinished = true;
        component.totalDifferencesFound = 0;
        component.gameRoom.userGame.gameData.gameForm.nbDifference = 1;
        component.gameRoom.userGame.username2 = 'test';
        component.differenceThreshold = 1;
        component.userDifferencesFound = 0;
        const matDialogSpy = spyOn(component.dialog, 'open').and.callThrough();
        component.endGame();
        expect(matDialogSpy).toHaveBeenCalledWith(EndgameDialogComponent, { disableClose: true, data: { gameFinished: true, gameWinner: false } });
    });

    it('endgame should call abandonConfirmation if game is not finished', () => {
        const abandonConfirmationSpy = spyOn(component, 'abandonConfirmation');
        component.endGame();
        expect(abandonConfirmationSpy).toHaveBeenCalled();
    });

    it('should open EndgameDialogComponent and abandon game if abandon is true', fakeAsync(() => {
        spyOn(component.dialog, 'open').and.returnValue(mockDialogRef as MatDialogRef<EndgameDialogComponent>);
        spyOn(component.router, 'navigate');
        spyOn(component.classicModeService, 'abandonGame');
        spyOn(component.classicModeService, 'disconnectSocket');
        component.abandonConfirmation();
        flush();
        expect(component.dialog.open).toHaveBeenCalled();
        expect(component.classicModeService.abandonGame).toHaveBeenCalled();
        expect(component.classicModeService.disconnectSocket).toHaveBeenCalled();
        expect(component.router.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should send error message in case of error', () => {
        component.username = gameRoom.userGame.username1;
        component.sendEvent('error');
        expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith(`Erreur par ${component.username}`, 'Système', component.gameRoom.roomId);
    });

    it('should send success message in case of success', () => {
        component.username = gameRoom.userGame.username1;
        component.sendEvent('success');
        expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith(`Différence trouvée par ${component.username}`, 'Système', component.gameRoom.roomId);
    });

    it('should send abandon message in case of abandon', () => {
        component.username = gameRoom.userGame.username1;
        component.sendEvent('abandon');
        expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith(`${component.username} a abandonné la partie`, 'Système', component.gameRoom.roomId);
    });
});
