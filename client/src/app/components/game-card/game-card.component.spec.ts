/* eslint-disable max-lines */
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { GameFinderService } from '@app/services/game-finder/game-finder.service';
import { GameSetupService } from '@app/services/game-setup/game-setup.service';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { Subject } from 'rxjs';
import { options, PageKeys } from 'src/assets/variables/game-card-options';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

describe('GameCardComponent', () => {
    const differenceMatrix: number[][] = [[]];

    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let gameFinderService: jasmine.SpyObj<GameFinderService>;
    let gameSetupService: jasmine.SpyObj<GameSetupService>;
    let verifyService: jasmine.SpyObj<VerifyInputService>;

    beforeEach(async () => {
        gameFinderService = jasmine.createSpyObj('GameFinderService', ['checkGame', 'gameExists$', 'connectSocket', 'canJoinGame']);
        gameFinderService.gameExists$ = new Subject<boolean>();
        gameSetupService = jasmine.createSpyObj('GameSetupService', ['getSlides', 'joinGame', 'initGameRoom', 'initGameMode']);
        verifyService = jasmine.createSpyObj('VerifyInputService', ['verify']);

        TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [AppRoutingModule, DynamicTestModule, RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: GameFinderService, useValue: gameFinderService },
                { provide: GameSetupService, useValue: gameSetupService },
                { provide: VerifyInputService, useValue: verifyService },
                { provide: MatDialog },
                { provide: MAT_DIALOG_DATA, useValue: {} },
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
            differenceMatrix,
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

    it('slide should have difficulty', () => {
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
        const focusSpy = spyOn(window.HTMLInputElement.prototype, 'focus').and.stub();
        component.focusInput();
        const timeout = 0;
        tick(timeout);
        expect(focusSpy).toHaveBeenCalled();
    }));

    it('should emit the slide name when onCardSelect is called', () => {
        const emitSpy = spyOn(component.notifySelected, 'emit');
        component.onCardSelect();
        expect(emitSpy).toHaveBeenCalledWith(component.slide.name);
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

    it('should set up gameMode to classic mode', () => {
        gameFinderService.gameExists$.next(true);
        expect(gameFinderService.gameMode).toEqual('mode classique');
        expect(gameSetupService.gameMode).toEqual('mode classique');
        expect(component.gameExists).toBeTruthy();
    });

    it('should add best times to the slide', () => {
        expect(component.slide.soloBestTimes.length).toEqual(3);
        expect(component.slide.vsBestTimes.length).toEqual(3);
    });

    it('should focus appropriate input', fakeAsync(() => {
        const inputElement = document.createElement('input');
        document.body.appendChild(inputElement);
        const focusSpy = spyOn(window.HTMLInputElement.prototype, 'focus').and.stub();
        component.focusInput();
        tick(0);
        expect(focusSpy).toHaveBeenCalled();
    }));

    it("should call 'checkGame' when 'gameExists' is false", () => {
        component.gameExists = false;
        component.checkGame();
        expect(gameFinderService.checkGame).toHaveBeenCalled();
    });

    it("should not call 'checkGame' when 'gameExists' is true", () => {
        component.gameExists = true;
        component.checkGame();
        expect(gameFinderService.checkGame).not.toHaveBeenCalled();
    });

    it('should emit the correct object when deleteCard is called', () => {
        const spy = spyOn(component.deleteNotify, 'emit');
        component.deleteCard();
        expect(spy).toHaveBeenCalledWith(component.slide.name);
    });

    it('should emit the correct object when resetCard is called', () => {
        const spy = spyOn(component.resetNotify, 'emit');
        component.resetCard();
        expect(spy).toHaveBeenCalledWith(component.slide.name);
    });

    it('should apply border if username verification returns false in solo', () => {
        verifyService.verify.and.returnValue(false);
        component.verifySoloInput();
        expect(component.applyBorder).toBeTruthy();
    });

    it('should call startSoloGame if conditions are met in solo', () => {
        verifyService.verify.and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startSoloGameSpy = spyOn(component as any, 'startSoloGame').and.stub();
        component.verifySoloInput();
        expect(startSoloGameSpy).toHaveBeenCalled();
    });

    it('should apply border if username verification returns false in multi', () => {
        verifyService.verify.and.returnValue(false);
        component.verifyMultiInput();
        expect(component.applyBorder).toBeTruthy();
    });

    it('should call createJoinMultiGame if conditions are met in multi', () => {
        verifyService.verify.and.returnValue(true);
        gameFinderService.connectSocket.and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createJoinMultiGameSpy = spyOn(component as any, 'createJoinMultiGame').and.stub();
        component.verifyMultiInput();
        expect(component.applyBorder).toBeFalsy();
        expect(gameFinderService.connectSocket).toHaveBeenCalled();
        expect(createJoinMultiGameSpy).toHaveBeenCalled();
    });

    it('should call gameSetupService joinGame if joinGame is called', () => {
        component.inputValue2 = 'test';
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<WaitingRoomComponent>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const waitingRoomSpy = spyOn((component as any).dialog, 'open');
        const notifySpy = spyOn(component.notify, 'emit');
        component.joinGame();
        expect(notifySpy).toHaveBeenCalledWith(component.slide);
        expect(waitingRoomSpy).toHaveBeenCalledWith(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
        expect(gameSetupService.joinGame).toHaveBeenCalledWith('test', component.slide.name);
    });

    it('should close the dialog on ngOnDestroy', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<WaitingRoomComponent>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn((component as any).dialogRef, 'close').and.stub();
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });

    it('startSoloGame should call gameSetupService initGameRoom and initGameMode', () => {
        component.inputValue1 = 'test';
        gameSetupService.initGameMode.and.stub();
        gameSetupService.initGameRoom.and.stub();
        const notifySpy = spyOn(component.notify, 'emit');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).startSoloGame();
        expect(gameSetupService.initGameRoom).toHaveBeenCalledWith('test', true);
        expect(gameSetupService.initGameMode).toHaveBeenCalledWith(component.slide.name);
        expect(notifySpy).toHaveBeenCalledWith(component.slide.name);
    });

    it('createJoinMultiGame should call canJoinGame if gameExists is true', () => {
        component.gameExists = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const canJoinGameSpy = spyOn(component as any, 'canJoinGame').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createJoinMultiGame();
        expect(canJoinGameSpy).toHaveBeenCalled();
    });

    it('createJoinMultiGame should call createGame if gameExists is false', () => {
        component.gameExists = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createGameSpy = spyOn(component as any, 'createGame').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createJoinMultiGame();
        expect(createGameSpy).toHaveBeenCalled();
    });

    it('createGame should call gameSetupService initGameRoom and initGameMode', () => {
        component.inputValue2 = 'test';
        gameSetupService.initGameMode.and.stub();
        gameSetupService.initGameRoom.and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const waitingRoomSpy = spyOn((component as any).dialog, 'open');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createGame();
        expect(gameSetupService.initGameRoom).toHaveBeenCalledWith('test', false);
        expect(gameSetupService.initGameMode).toHaveBeenCalledWith(component.slide.name);
        expect(waitingRoomSpy).toHaveBeenCalledWith(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    });

    it('canJoinGame should call gameFinderService.canJoinGame', () => {
        component.inputValue2 = 'test';
        gameFinderService.canJoinGame.and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).canJoinGame();
        expect(gameFinderService.canJoinGame).toHaveBeenCalledWith('test', component, component.slide.name);
    });
});
