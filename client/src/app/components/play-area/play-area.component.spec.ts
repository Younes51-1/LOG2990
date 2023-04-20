/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData, GameRoom, UserGame } from '@app/interfaces/game';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { GameService } from '@app/services/game/game.service';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { Subject } from 'rxjs';
import { Color } from 'src/assets/variables/color';

@NgModule({
    imports: [HttpClientModule],
})
export class DynamicTestModule {}

const createAndPopulateMatrix = (value: number): number[][] => {
    const matrix: number[][] = [];
    for (let i = 0; i < 3; i++) {
        matrix[i] = [];
        for (let j = 0; j < 3; j++) {
            matrix[i][j] = value;
        }
    }
    return matrix;
};

const invalidPixelValue = -1;

describe('PlayAreaComponent', () => {
    const differenceMatrix: number[][] = [[]];
    const gameData: GameData = {
        name: '',
        nbDifference: 0,
        image1url: 'https://picsum.photos/402',
        image2url: 'https://picsum.photos/204',
        difficulty: '',
        soloBestTimes: [],
        vsBestTimes: [],
        differenceMatrix,
    };
    const userGame: UserGame = { username1: '', gameData, nbDifferenceFound: 0, timer: 0 };
    const gameRoom: GameRoom = { userGame, roomId: 'testRoom', started: false, gameMode: 'mode Classique' };

    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let detectionService: jasmine.SpyObj<DetectionDifferenceService>;
    let gameService: jasmine.SpyObj<GameService>;
    let playAreaService: jasmine.SpyObj<PlayAreaService>;

    beforeEach(async () => {
        detectionService = jasmine.createSpyObj('DetectionDifferenceService', ['extractDifference']);
        gameService = jasmine.createSpyObj('GameService', ['changeTime', 'nextGame', 'sendServerValidate', 'isLimitedTimeMode', 'getIsTyping']);
        gameService.serverValidateResponse$ = new Subject<DifferenceTry>();
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
            'endCheatMode',
            'startCheatMode',
        ]);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [DynamicTestModule],
            providers: [
                { provide: DetectionDifferenceService, useValue: detectionService },
                { provide: GameService, useValue: gameService },
                { provide: PlayAreaService, useValue: playAreaService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return width and height of the canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.width).toEqual(640);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.height).toEqual(480);
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect((component as any).buttonPressed).toEqual(expectedKey);
    });

    it('should call handleImageLoad when original image is loaded', (done) => {
        playAreaService.handleImageLoad.and.stub();
        (component as any).original.src = 'https://picsum.photos/id/88/200/300';
        component.ngOnChanges();
        (component as any).original.dispatchEvent(new Event('load'));
        setTimeout(() => {
            expect(playAreaService.handleImageLoad).toHaveBeenCalledWith((component as any).context1, (component as any).original);
            done();
        }, 0);
    });

    it('should call handleImageLoad when modified image is loaded', (done) => {
        playAreaService.handleImageLoad.and.stub();
        (component as any).modified.src = 'https://picsum.photos/id/88/200/300';
        component.ngOnChanges();
        (component as any).modified.dispatchEvent(new Event('load'));
        setTimeout(() => {
            expect(playAreaService.handleImageLoad).toHaveBeenCalledWith((component as any).context2, (component as any).modified);
            done();
        }, 0);
    });

    it('buttonDetect should not call cheat mode in user is typing in chat', () => {
        const expectedKey = 't';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        gameService.getIsTyping.and.returnValue(true);
        const playAreaServiceSpy = playAreaService.cheatMode.and.stub();
        component.buttonDetect(buttonEvent);
        expect(playAreaServiceSpy).not.toHaveBeenCalled();
    });

    it('buttonDetect should call the cheatMode function', () => {
        const expectedKey = 't';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        gameService.getIsTyping.and.returnValue(false);
        const playAreaServiceSpy = playAreaService.cheatMode.and.stub();
        component.buttonDetect(buttonEvent);
        expect(playAreaServiceSpy).toHaveBeenCalled();
    });

    it('buttonDetect should emit toggleHint', () => {
        const expectedKey = 'i';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.gameRoom = gameRoom;
        const emitSpy = spyOn(component.toggleHint, 'emit');
        component.buttonDetect(buttonEvent);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('buttonDetect should not emit toggleHint in multi game', () => {
        const expectedKey = 'i';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.gameRoom = gameRoom;
        component.gameRoom.userGame.username2 = 'test';
        const emitSpy = spyOn(component.toggleHint, 'emit');
        component.buttonDetect(buttonEvent);
        expect(emitSpy).not.toHaveBeenCalled();
        component.gameRoom.userGame.username2 = '';
    });

    it('mouseClickAttempt should validate the attempt with the server', fakeAsync(async () => {
        (component as any).playerIsAllowedToClick = true;
        (component as any).differenceMatrix = createAndPopulateMatrix(1);
        const mockClick = new MouseEvent('mousedown');
        gameService.sendServerValidate.and.stub();
        await component.mouseClickAttempt(mockClick, component.canvas1.nativeElement);
        expect(gameService.sendServerValidate).toHaveBeenCalled();
    }));

    it('mouseClickAttempt should call the errorRetroaction for a mistake', fakeAsync(async () => {
        (component as any).playerIsAllowedToClick = true;
        (component as any).differenceMatrix = createAndPopulateMatrix(invalidPixelValue);
        const mockClick = new MouseEvent('mousedown');
        const spyErrorRetroaction = spyOn(component as any, 'errorRetroaction').and.stub();
        await component.mouseClickAttempt(mockClick, component.canvas1.nativeElement);
        expect(spyErrorRetroaction).toHaveBeenCalled();
    }));

    it('should call setSpeed, setComponent, setCheatMode and setContexts from play area service', () => {
        playAreaService.setSpeed.and.stub();
        playAreaService.setComponent.and.stub();
        playAreaService.setCheatMode.and.stub();
        playAreaService.setContexts.and.stub();
        component.ngAfterViewInit();
        expect(playAreaService.setSpeed).toHaveBeenCalledWith(1);
        expect(playAreaService.setComponent).toHaveBeenCalledWith(component, false);
        expect(playAreaService.setCheatMode).toHaveBeenCalled();
        expect(playAreaService.setContexts).toHaveBeenCalled();
    });

    it('should react accordingly on validated response from the server', () => {
        const correctRetroactionSpy = spyOn(component as any, 'correctRetroaction').and.stub();
        const errorRetroactionSpy = spyOn(component as any, 'errorRetroaction').and.stub();
        const differenceTry: DifferenceTry = { validated: true, differencePos: { x: 0, y: 0 }, username: 'Test' };
        component.ngAfterViewInit();
        gameService.serverValidateResponse$.next(differenceTry);
        expect(correctRetroactionSpy).toHaveBeenCalledWith(differenceTry.differencePos);
        expect(errorRetroactionSpy).not.toHaveBeenCalled();
    });

    it('should call nextGame, changeTime and ngOnChanges if game is limited time mode', () => {
        spyOn(component, 'ngOnChanges').and.stub();
        gameService.isLimitedTimeMode.and.returnValue(true);
        gameService.gameConstants = { initialTime: 1, bonusTime: 2, penaltyTime: 1 };
        component.nextGame();
        expect(gameService.nextGame).toHaveBeenCalled();
        expect(gameService.changeTime).toHaveBeenCalledWith(2);
        expect(component.ngOnChanges).toHaveBeenCalled();
    });

    it('should not call nextGame, changeTime and ngOnChanges if game is classic mode', () => {
        spyOn(component, 'ngOnChanges').and.stub();
        gameService.isLimitedTimeMode.and.returnValue(false);
        gameService.gameConstants = { initialTime: 1, bonusTime: 2, penaltyTime: 1 };
        component.nextGame();
        expect(gameService.nextGame).not.toHaveBeenCalled();
        expect(gameService.changeTime).not.toHaveBeenCalled();
        expect(component.ngOnChanges).not.toHaveBeenCalled();
    });

    it('should not call endCheatMode and startCheatMode if cheatMode is activated', () => {
        spyOn(component, 'ngOnChanges').and.stub();
        gameService.isLimitedTimeMode.and.returnValue(true);
        gameService.gameConstants = { initialTime: 1, bonusTime: 2, penaltyTime: 1 };
        playAreaService.isCheatModeOn = true;
        playAreaService.endCheatMode.and.stub();
        playAreaService.startCheatMode.and.stub();
        component.nextGame();
        expect(gameService.nextGame).toHaveBeenCalled();
        expect(gameService.changeTime).toHaveBeenCalled();
        expect(component.ngOnChanges).toHaveBeenCalled();
        expect(playAreaService.endCheatMode).toHaveBeenCalled();
        expect(playAreaService.startCheatMode).toHaveBeenCalled();
    });

    it('should not call endCheatMode and startCheatMode if cheatMode is not activated', () => {
        spyOn(component, 'ngOnChanges').and.stub();
        gameService.isLimitedTimeMode.and.returnValue(true);
        gameService.gameConstants = { initialTime: 1, bonusTime: 2, penaltyTime: 1 };
        playAreaService.isCheatModeOn = false;
        playAreaService.endCheatMode.and.stub();
        playAreaService.startCheatMode.and.stub();
        component.nextGame();
        expect(gameService.nextGame).toHaveBeenCalled();
        expect(gameService.changeTime).toHaveBeenCalled();
        expect(component.ngOnChanges).toHaveBeenCalled();
        expect(playAreaService.endCheatMode).not.toHaveBeenCalled();
        expect(playAreaService.startCheatMode).not.toHaveBeenCalled();
    });

    it('should react accordingly on invalid response from server', () => {
        const correctRetroactionSpy = spyOn(component as any, 'correctRetroaction').and.stub();
        const errorRetroactionSpy = spyOn(component as any, 'errorRetroaction').and.stub();
        const differenceTry: DifferenceTry = { validated: false, differencePos: { x: 0, y: 0 }, username: 'Test' };
        (component as any).gameService.username = differenceTry.username;
        component.ngAfterViewInit();
        gameService.serverValidateResponse$.next(differenceTry);
        expect(correctRetroactionSpy).not.toHaveBeenCalled();
        expect(errorRetroactionSpy).toHaveBeenCalledWith((component as any).canvasClicked);
    });

    it('should correctly set the variables if the desired gameRoom exists', () => {
        (component as any).gameService.gameRoom = gameRoom;
        component.gameRoom = gameRoom;
        component.ngOnChanges();
        expect((component as any).differenceMatrix).toEqual(differenceMatrix);
        expect((component as any).original.src).not.toEqual('');
        expect((component as any).modified.src).not.toEqual('');
    });

    it('correctRetroaction should call audio play and pause and correctAnswerVisuals ', () => {
        (component as any).playerIsAllowedToClick = true;
        spyOn((component as any).audioValid, 'pause');
        spyOn((component as any).audioValid, 'play');
        component.differenceMatrix = differenceMatrix;
        (component as any).correctRetroaction({ x: 1, y: 2 });
        expect((component as any).playerIsAllowedToClick).toBeFalsy();
        expect(playAreaService.correctAnswerVisuals).toHaveBeenCalledWith({ x: 1, y: 2 }, differenceMatrix);
        expect((component as any).audioValid.pause).toHaveBeenCalled();
        expect((component as any).audioValid.currentTime).toEqual(0);
        expect((component as any).audioValid.play).toHaveBeenCalled();
    });

    it('errorRetroaction should call audio play and errorAnswerVisuals ', () => {
        (component as any).playerIsAllowedToClick = true;
        playAreaService.errorAnswerVisuals.and.stub();
        spyOn((component as any).audioInvalid, 'play');
        component.mousePosition = { x: 1, y: 2 };
        (component as any).errorRetroaction((component as any).canvasClicked);
        expect((component as any).playerIsAllowedToClick).toBeFalsy();
        expect(playAreaService.errorAnswerVisuals).toHaveBeenCalledWith((component as any).canvasClicked, component.mousePosition);
        expect((component as any).audioInvalid.play).toHaveBeenCalled();
    });

    it("should change differenceMatrix, original, modified source if gameRoom isn't undefined", () => {
        component.gameRoom = gameRoom;
        (component as any).gameService.gameRoom = gameRoom;
        component.ngOnChanges();
        expect((component as any).differenceMatrix).toEqual(gameRoom.userGame.gameData.differenceMatrix);
        expect((component as any).original.src).toContain(gameRoom.userGame.gameData.image1url);
        expect((component as any).modified.src).toContain(gameRoom.userGame.gameData.image2url);
    });

    it("shouldn't change differenceMatrix, original, modified source if gameRoom is undefined", () => {
        component.gameRoom = undefined as unknown as GameRoom;
        (component as any).original.src = 'https://picsum.photos/id/88/200/300';
        (component as any).modified.src = 'https://picsum.photos/id/88/200/300';
        (component as any).gameService.gameRoom = gameRoom;
        component.ngOnChanges();
        expect((component as any).differenceMatrix).toEqual(undefined as unknown as number[][]);
        expect((component as any).original.src).toContain('https://picsum.photos/id/88/200/300');
        expect((component as any).modified.src).toContain('https://picsum.photos/id/88/200/300');
    });

    it('verifyDifferenceMatrix should call createAndFillNewLayer in cheat option', () => {
        (component as any).differenceMatrix = [[]];
        playAreaService.createAndFillNewLayer.and.stub();
        (component as any).verifyDifferenceMatrix('cheat');
        expect(playAreaService.createAndFillNewLayer).toHaveBeenCalledWith('#fc5603' as Color, true, false, [[]]);
    });

    it('verifyDifferenceMatrix should call createAndFillNewLayer in hint option', () => {
        (component as any).differenceMatrix = [[]];
        playAreaService.createAndFillNewLayer.and.stub();
        (component as any).verifyDifferenceMatrix('hint', [[]]);
        expect(playAreaService.createAndFillNewLayer).toHaveBeenCalledWith('#CFB53B' as Color, false, true, [[]]);
    });
});
