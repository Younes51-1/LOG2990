import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { CreateJoinGameDialogComponent } from '@app/components/create-join-game-dialog/create-join-game-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameFinderService } from '@app/services/game-finder/game-finder.service';
import { GameSetupService } from '@app/services/game-setup/game-setup.service';
import { Subject } from 'rxjs';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { GameData } from '@app/interfaces/game';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

describe('CreateJoinGameDialogComponent', () => {
    const differenceMatrix: number[][] = [[]];
    const gameData: GameData = {
        name: '',
        nbDifference: 0,
        image1url: '',
        image2url: '',
        difficulty: '',
        soloBestTimes: [],
        vsBestTimes: [],
        differenceMatrix,
    };

    let component: CreateJoinGameDialogComponent;
    let fixture: ComponentFixture<CreateJoinGameDialogComponent>;
    let gameFinderService: jasmine.SpyObj<GameFinderService>;
    let gameSetupService: jasmine.SpyObj<GameSetupService>;
    let verifyService: jasmine.SpyObj<VerifyInputService>;

    beforeEach(async () => {
        gameFinderService = jasmine.createSpyObj('GameFinderService', ['checkGame', 'gameExists$', 'connectSocket', 'canJoinGame']);
        gameFinderService.gameExists$ = new Subject<boolean>();
        gameSetupService = jasmine.createSpyObj('GameSetupService', ['getSlides', 'joinGame', 'initGameRoom', 'initGameMode']);
        verifyService = jasmine.createSpyObj('VerifyInputService', ['verify']);

        await TestBed.configureTestingModule({
            declarations: [CreateJoinGameDialogComponent],
            imports: [AppRoutingModule, DynamicTestModule, RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog },
                { provide: GameFinderService, useValue: gameFinderService },
                { provide: GameSetupService, useValue: gameSetupService },
                { provide: VerifyInputService, useValue: verifyService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateJoinGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set gameMode to limited-time-mode', () => {
        component.ngOnInit();
        gameFinderService.gameExists$.next(true);
        expect(gameFinderService.gameMode).toEqual('limited-time-mode');
        expect(gameSetupService.gameMode).toEqual('limited-time-mode');
        expect(component.gameExists).toBeTruthy();
    });

    it('should focus appropriate input', fakeAsync(() => {
        const inputElement = document.createElement('input');
        document.body.appendChild(inputElement);
        const focusSpy = spyOn(window.HTMLInputElement.prototype, 'focus').and.callFake(() => {
            return;
        });
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

    it('should apply border if username verification returns false in solo', () => {
        verifyService.verify.and.returnValue(false);
        component.verifySoloInput();
        expect(component.applyBorder).toBeTruthy();
    });

    it('should apply border if there is not a games in solo', () => {
        verifyService.verify.and.returnValue(true);
        gameSetupService.getSlides.and.returnValue([]);
        component.verifySoloInput();
        expect(component.applyBorder).toBeTruthy();
    });

    it('should call startSoloGame if conditions are met in solo', () => {
        verifyService.verify.and.returnValue(true);
        gameSetupService.getSlides.and.returnValue([gameData]);
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

    it('should apply border if there is not a games in multi', () => {
        verifyService.verify.and.returnValue(true);
        gameSetupService.getSlides.and.returnValue([]);
        component.verifyMultiInput();
        expect(component.applyBorder).toBeTruthy();
    });

    it('should call createJoinMultiGame if conditions are met in multi', () => {
        verifyService.verify.and.returnValue(true);
        gameSetupService.getSlides.and.returnValue([gameData]);
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
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<CreateJoinGameDialogComponent>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dialogRefCloseSpy = spyOn((component as any).dialogRef, 'close').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const waitingRoomSpy = spyOn((component as any).dialog, 'open');
        component.joinGame();
        expect(dialogRefCloseSpy).toHaveBeenCalled();
        expect(waitingRoomSpy).toHaveBeenCalledWith(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
        expect(gameSetupService.joinGame).toHaveBeenCalledWith('test');
    });

    it('startSoloGame should call gameSetupService initGameRoom and initGameMode', () => {
        component.inputValue1 = 'test';
        gameSetupService.initGameMode.and.stub();
        gameSetupService.initGameRoom.and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).startSoloGame();
        expect(gameSetupService.initGameRoom).toHaveBeenCalledWith('test', true);
        expect(gameSetupService.initGameMode).toHaveBeenCalledWith();
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
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<CreateJoinGameDialogComponent>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dialogRefCloseSpy = spyOn((component as any).dialogRef, 'close').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const waitingRoomSpy = spyOn((component as any).dialog, 'open');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).createGame();
        expect(gameSetupService.initGameRoom).toHaveBeenCalledWith('test', false);
        expect(gameSetupService.initGameMode).toHaveBeenCalledWith();
        expect(dialogRefCloseSpy).toHaveBeenCalled();
        expect(waitingRoomSpy).toHaveBeenCalledWith(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    });

    it('canJoinGame should call gameFinderService.canJoinGame', () => {
        component.inputValue2 = 'test';
        gameFinderService.canJoinGame.and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).canJoinGame();
        expect(gameFinderService.canJoinGame).toHaveBeenCalledWith('test', component);
    });
});
