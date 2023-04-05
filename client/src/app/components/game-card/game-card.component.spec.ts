/* eslint-disable max-lines */
// eslint-disable-next-line max-classes-per-file
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameData } from '@app/interfaces/game';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { options, PageKeys } from 'src/assets/variables/game-card-options';
import SpyObj = jasmine.SpyObj;

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}
class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('GameCardComponent', () => {
    const differenceMatrix: number[][] = [[]];
    const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulty: '', soloBestTimes: [], vsBestTimes: [] };
    const gameData: GameData = { gameForm, differenceMatrix };

    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let communicationServiceSpy: SpyObj<CommunicationHttpService>;
    let communicationSocketService: CommunicationSocketService;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGame']);
        communicationServiceSpy.getGame.and.returnValue(of(gameData));
        jasmine.createSpyObj('ClassicModeService', [
            'timer$',
            'differencesFound$',
            'gameFinished$',
            'totalDifferences$',
            'gameRoom$',
            'userDifferences$',
            'serverValidateResponse$',
            'rejected$',
            'accepted$',
            'gameCanceled$',
            'abandoned$',
        ]);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socketServiceMock as any).socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [AppRoutingModule, DynamicTestModule, RouterTestingModule, HttpClientTestingModule],
            providers: [
                ClassicModeService,
                CommunicationSocketService,
                { provide: CommunicationSocketService, useValue: socketServiceMock },
                { provide: CommunicationHttpService, useValue: communicationServiceSpy },
                { provide: MatDialog },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                CommunicationHttpService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.page = PageKeys.Config;
        component.slide = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulty: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
                { name: 'player3', time: 150 },
            ],
            vsBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
                { name: 'player3', time: 150 },
            ],
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('slide should have name', () => {
        expect(component.slide.name).toBeTruthy();
    });

    it('should have game image', () => {
        const image = fixture.debugElement.nativeElement.querySelector('img');
        expect(image.src).toEqual('https://example.com/image1.jpg');
    });

    it('slide should have difficulte', () => {
        expect(component.slide.difficulty).toBeTruthy();
    });

    it('should have three best solo scores', () => {
        expect(component.slide.soloBestTimes.length).toEqual(3);
    });

    it('should have three best 1v1 scores', () => {
        expect(component.slide.vsBestTimes.length).toEqual(3);
    });

    it('should have play button for solo mode', () => {
        const btn1 = fixture.debugElement.nativeElement.getElementsByTagName('button')[0];
        expect(btn1).not.toBeUndefined();
    });

    it('should have create/join button for 1v1 mode', () => {
        const btn2 = fixture.debugElement.nativeElement.getElementsByTagName('button')[1];
        expect(btn2).not.toBeUndefined();
    });

    it('should set the correct properties when the page is Config', () => {
        component.ngOnInit();
        expect(component.routeOne).toEqual(options.config.routeOne);
        expect(component.btnOne).toEqual(options.config.btnOne);
        expect(component.routeTwo).toEqual(options.config.routeTwo);
        expect(component.btnTwo).toEqual(options.config.btnTwo);
    });

    it('should set the correct properties when the page is Selection', () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        expect(component.routeOne).toEqual(options.selection.routeOne);
        expect(component.btnOne).toEqual(options.selection.btnOne);
        expect(component.routeTwo).toEqual(options.selection.routeTwo);
        expect(component.btnTwo).toEqual(options.selection.btnTwo);
    });

    it("should call check game when 'Option multijoueur' is clicked", () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        fixture.detectChanges();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const spy = spyOn(component, 'checkGame');
        const btn = fixture.debugElement.nativeElement.getElementsByTagName('button')[1];
        btn.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should focus appropriate input', fakeAsync(() => {
        const inputElement = document.createElement('input');
        document.body.appendChild(inputElement);
        const focusSpy = spyOn(window.HTMLInputElement.prototype, 'focus').and.callFake(() => {
            return;
        });
        component.focusInput();
        const timeout = 0;
        tick(timeout);
        expect(focusSpy).toHaveBeenCalled();
    }));

    it('should emit the slide name when onCardSelect is called', () => {
        const emitSpy = spyOn(component.notifySelected, 'emit');
        component.onCardSelect();
        expect(emitSpy).toHaveBeenCalled();
    });

    it("should call check game when 'Option multijoueur' is clicked", () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        fixture.detectChanges();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const spy = spyOn(component, 'checkGame');
        const btn = fixture.debugElement.nativeElement.getElementsByTagName('button')[1];
        btn.click();
        expect(spy).toHaveBeenCalled();
    });

    it("should call 'classicModeService.connectSocket' when 'checkGame' is called", () => {
        // Needed to access private properties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn((component as any).classicModeService, 'connectSocket');
        component.checkGame();
        expect(spy).toHaveBeenCalled();
    });

    it("should send 'checkGame' when 'gameExists' is false", () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        component.gameExists = false;
        component.checkGame();
        expect(spy).toHaveBeenCalledWith('checkGame', component.slide.name);
    });

    it("should not send 'checkGame' when 'gameExists' is true", () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        component.gameExists = true;
        component.checkGame();
        expect(spy).not.toHaveBeenCalled();
    });

    it("should change 'gameExists' to true when a game is found", () => {
        component.checkGame();
        socketHelper.peerSideEmit('gameFound', component.slide.name);
        expect(component.gameExists).toBe(true);
    });

    it("should not change 'gameExists' to true when a game is found but different name", () => {
        component.checkGame();
        socketHelper.peerSideEmit('gameFound', 'differentName');
        expect(component.gameExists).toBe(false);
    });

    it("should change 'gameExists' to false when a game is deleted", () => {
        component.gameExists = true;
        component.checkGame();
        socketHelper.peerSideEmit('gameDeleted', component.slide.name);
        expect(component.gameExists).toBe(false);
    });

    it("should not change 'gameExists' to true when a game is deleted but different name", () => {
        component.gameExists = true;
        component.checkGame();
        socketHelper.peerSideEmit('gameDeleted', 'differentName');
        expect(component.gameExists).toBe(true);
    });

    it('should emit the correct value when startSoloGame is called', fakeAsync(() => {
        // needed to call private property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const routerSpy = spyOn((component as any).router, 'navigate').and.stub();
        const spy = spyOn(component.notify, 'emit');
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).startSoloGame();
        tick();
        expect(spy).toHaveBeenCalledWith(component.slide.name);
        expect(routerSpy).toHaveBeenCalledWith([options.config.routeOne]);
    }));

    it('should emit the correct object when deleteCard is called', () => {
        const spy = spyOn(component.deleteNotify, 'emit');
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).deleteCard();
        expect(spy).toHaveBeenCalledWith(component.slide.name);
    });

    it('should emit the correct object when resetCard is called', () => {
        const spy = spyOn(component.resetNotify, 'emit');
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).resetCard();
        expect(spy).toHaveBeenCalledWith(component.slide.name);
    });

    it("should call 'initClassicMode' by startSoloGame", fakeAsync(() => {
        // needed to call private property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const routerSpy = spyOn((component as any).router, 'navigate').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const classicModespy = spyOn((component as any).classicModeService, 'initClassicMode');
        component.page = PageKeys.Selection;
        component.ngOnInit();
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).startSoloGame();
        tick();
        expect(classicModespy).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalledWith([options.selection.routeOne]);
    }));

    it("should call 'createGame' when 'createJoinMultiGame' is called and all requirements are met", () => {
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn(component as any, 'createGame');
        component.gameExists = false;
        component.page = PageKeys.Selection;
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createJoinMultiGame();
        expect(spy).toHaveBeenCalled();
    });

    it("should call 'canJoinGame' when 'createJoinMultiGame' is called and all requirements are met", () => {
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn(component as any, 'canJoinGame');
        component.gameExists = true;
        component.page = PageKeys.Selection;
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createJoinMultiGame();
        expect(spy).toHaveBeenCalled();
    });

    it("should call 'initClassicMode' and emit slide and open waiting room dialog when 'createGame' is called", () => {
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createWaintingRoomSpy = spyOn((component as any).classicModeService, 'initClassicMode');
        const emitSpy = spyOn(component.notify, 'emit');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dialogSpy = spyOn((component as any).dialog, 'open');
        component.inputValue2 = 'test';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createGame();
        expect(createWaintingRoomSpy).toHaveBeenCalledWith(component.slide.name, 'test', false);
        expect(emitSpy).toHaveBeenCalledWith(component.slide);
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('should emit the correct object when createGame is called', () => {
        const spy = spyOn(component.notify, 'emit');
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createGame();
        expect(spy).toHaveBeenCalledWith(component.slide);
    });

    it("should call send 'canJoinGame' when 'canJoinGame' is called", () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        component.inputValue2 = 'test';
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).canJoinGame();
        expect(spy).toHaveBeenCalledWith('canJoinGame', { gameName: component.slide.name, username: 'test' });
    });

    it("should set 'applyBorder' to true and disconnectSocket when cannot join a game", () => {
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn((component as any).classicModeService, 'disconnectSocket');
        component.applyBorder = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).canJoinGame();
        socketHelper.peerSideEmit('cannotJoinGame');
        expect(spy).toHaveBeenCalled();
        expect(component.applyBorder).toBe(true);
    });

    it("should set 'createJoin' to true and call 'joinGame' when you can join a game", () => {
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn(component as any, 'joinGame');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).canJoinGame();
        socketHelper.peerSideEmit('canJoinGame');
        expect(spy).toHaveBeenCalled();
    });

    it("should call 'joinWaitingRoomClassicModeMulti' and emit slide and open waiting room dialog when 'joinGame' is called", () => {
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const joinWaintingRoomSpy = spyOn((component as any).classicModeService, 'joinWaitingRoomClassicModeMulti');
        const emitSpy = spyOn(component.notify, 'emit');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dialogSpy = spyOn((component as any).dialog, 'open');
        component.inputValue2 = 'test';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).joinGame();
        expect(joinWaintingRoomSpy).toHaveBeenCalledWith(component.slide.name, 'test');
        expect(emitSpy).toHaveBeenCalledWith(component.slide);
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('should toggle the border if inputValue1 is incorrect', () => {
        component.inputValue1 = '';
        component.applyBorder = false;
        component.verifySoloInput();
        expect(component.applyBorder).toBe(true);
    });

    it('should call startSoloGame if inputValue1 is correct', () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component as any, 'startSoloGame');
        component.inputValue1 = 'test';
        component.verifySoloInput();
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).startSoloGame).toHaveBeenCalled();
    });

    it('should toggle the border if inputValue2 is incorrect', () => {
        component.inputValue2 = '';
        component.applyBorder = false;
        component.verifyMultiInput();
        expect(component.applyBorder).toBe(true);
    });

    it('should call createJoinMultiGame and connectSocket if inputValue1 is correct', () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        // needed to call private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn((component as any).classicModeService, 'connectSocket');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component as any, 'createJoinMultiGame');
        component.inputValue2 = 'test';
        component.verifyMultiInput();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).classicModeService.connectSocket).toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).createJoinMultiGame).toHaveBeenCalled();
    });
});
