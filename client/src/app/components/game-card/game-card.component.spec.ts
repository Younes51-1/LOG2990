// eslint-disable-next-line max-classes-per-file
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameData } from '@app/interfaces/game';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
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
    const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
    const gameData: GameData = { gameForm, differenceMatrix };

    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let communicationServiceSpy: SpyObj<CommunicationService>;
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
        socketServiceMock.socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [AppRoutingModule, DynamicTestModule, RouterTestingModule],
            providers: [
                ClassicModeService,
                CommunicationSocketService,
                { provide: CommunicationSocketService, useValue: socketServiceMock },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                CommunicationService,
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
            difficulte: 'easy',
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
        expect(component.slide.difficulte).toBeTruthy();
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

    it("should call 'classicModeService.connect' when 'checkGame' is called", () => {
        const spy = spyOn(component.classicModeService, 'connect');
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

    it('should emit the correct value when startSoloGame is called', () => {
        const spy = spyOn(component.notify, 'emit');
        component.startSoloGame();
        expect(spy).toHaveBeenCalledWith(component.slide.name);
    });

    it("should call 'initClassicMode' by startSoloGame if page is Selection", () => {
        const spy = spyOn(component.classicModeService, 'initClassicMode');
        component.page = PageKeys.Selection;
        component.ngOnInit();
        component.startSoloGame();
        expect(spy).toHaveBeenCalled();
    });

    it("shouldn't call 'initClassicMode' by startSoloGame if page isn't Selection", () => {
        const spy = spyOn(component.classicModeService, 'initClassicMode');
        component.startSoloGame();
        expect(spy).not.toHaveBeenCalled();
    });

    it("should call 'createGame' and set 'createJoin' to true when 'createJoinMultiGame' is called and all requirements are met", () => {
        const spy = spyOn(component, 'createGame');
        component.createJoin = false;
        component.gameExists = false;
        component.page = PageKeys.Selection;
        component.createJoinMultiGame();
        expect(spy).toHaveBeenCalled();
        expect(component.createJoin).toBe(true);
    });

    it("should call 'canJoinGame' when 'createJoinMultiGame' is called and all requirements are met", () => {
        const spy = spyOn(component, 'canJoinGame');
        component.gameExists = true;
        component.page = PageKeys.Selection;
        component.createJoinMultiGame();
        expect(spy).toHaveBeenCalled();
    });

    it("should call 'initClassicMode' and emit slide and open waiting room dialog when 'createGame' is called", () => {
        const createWaintingRoomSpy = spyOn(component.classicModeService, 'initClassicMode');
        const emitSpy = spyOn(component.notify, 'emit');
        const dialogSpy = spyOn(component.dialog, 'open');
        component.inputValue2 = 'test';
        component.createGame();
        expect(createWaintingRoomSpy).toHaveBeenCalledWith(component.slide.name, 'test', false);
        expect(emitSpy).toHaveBeenCalledWith(component.slide);
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('should emit the correct object when createGame is called', () => {
        const spy = spyOn(component.notify, 'emit');
        component.createGame();
        expect(spy).toHaveBeenCalledWith(component.slide);
    });

    it("should call send 'canJoinGame' when 'canJoinGame' is called", () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        component.inputValue2 = 'test';
        component.canJoinGame();
        expect(spy).toHaveBeenCalledWith('canJoinGame', [component.slide.name, 'test']);
    });

    it("should set 'applyBorder' to false and disconnect when cannot join a game", () => {
        const spy = spyOn(component.classicModeService, 'disconnect');
        component.applyBorder = true;
        component.canJoinGame();
        socketHelper.peerSideEmit('cannotJoinGame');
        expect(spy).toHaveBeenCalled();
        expect(component.applyBorder).toBe(false);
    });

    it("should set 'createJoin' to true and call 'joinGame' when you can join a game", () => {
        const spy = spyOn(component, 'joinGame');
        component.createJoin = false;
        component.canJoinGame();
        socketHelper.peerSideEmit('canJoinGame');
        expect(spy).toHaveBeenCalled();
        expect(component.createJoin).toBe(true);
    });

    it("should call 'joinWaitingRoomClassicModeMulti' and emit slide and open waiting room dialog when 'joinGame' is called", () => {
        const joinWaintingRoomSpy = spyOn(component.classicModeService, 'joinWaitingRoomClassicModeMulti');
        const emitSpy = spyOn(component.notify, 'emit');
        const dialogSpy = spyOn(component.dialog, 'open');
        component.inputValue2 = 'test';
        component.joinGame();
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
        spyOn(component, 'startSoloGame');
        component.inputValue1 = 'test';
        component.verifySoloInput();
        expect(component.startSoloGame).toHaveBeenCalled();
    });

    it('should toggle the border if inputValue2 is incorrect', () => {
        component.inputValue2 = '';
        component.applyBorder = false;
        component.verifyMultiInput();
        expect(component.applyBorder).toBe(true);
    });

    it('should call createJoinMultiGame and connect if inputValue1 is correct', () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        spyOn(component.classicModeService, 'connect');
        spyOn(component, 'createJoinMultiGame');
        component.inputValue2 = 'test';
        component.verifyMultiInput();
        expect(component.classicModeService.connect).toHaveBeenCalled();
        expect(component.createJoinMultiGame).toHaveBeenCalled();
    });
});
