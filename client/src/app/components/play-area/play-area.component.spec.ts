/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData, GameRoom, UserGame } from '@app/interfaces/game';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';

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
    const gameForm = {
        name: '',
        nbDifference: 0,
        image1url: 'https://picsum.photos/402',
        image2url: 'https://picsum.photos/204',
        difficulty: '',
        soloBestTimes: [],
        vsBestTimes: [],
    };
    const gameData: GameData = { gameForm, differenceMatrix };
    const userGame: UserGame = { username1: '', gameData, nbDifferenceFound: 0, timer: 0 };
    const gameRoom: GameRoom = { userGame, roomId: 'testRoom', started: false };

    let component: PlayAreaComponent;
    let classicModeService: ClassicModeService;
    let fixture: ComponentFixture<PlayAreaComponent>;
    // let detectionDifferenceService: DetectionDifferenceService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [DynamicTestModule],
            providers: [DetectionDifferenceService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        classicModeService = TestBed.inject(ClassicModeService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect((component as any).buttonPressed).toEqual(expectedKey);
    });

    it('mouseClickAttempt should validate the attempt with the server', fakeAsync(async () => {
        (component as any).playerIsAllowedToClick = true;
        (component as any).differenceMatrix = createAndPopulateMatrix(1);
        const mockClick = new MouseEvent('mousedown');
        const spy = spyOn((component as any).classicModeService, 'validateDifference').and.callFake(() => {
            return;
        });
        await component.mouseClickAttempt(mockClick, component.canvas1.nativeElement);
        expect(spy).toHaveBeenCalled();
    }));

    it('mouseClickAttempt should call the errorretroaction for a mistake', fakeAsync(async () => {
        (component as any).playerIsAllowedToClick = true;
        (component as any).differenceMatrix = createAndPopulateMatrix(invalidPixelValue);
        const mockClick = new MouseEvent('mousedown');
        const spyErrorRetroaction = spyOn(component as any, 'errorRetroaction').and.callFake(() => {
            return;
        });
        await component.mouseClickAttempt(mockClick, component.canvas1.nativeElement);
        expect(spyErrorRetroaction).toHaveBeenCalled();
    }));

    it('should react accordingly on validated response from the server', () => {
        const serverValidateResponseSpy = spyOn((component as any).classicModeService.serverValidateResponse$, 'subscribe').and.callThrough();
        const correctRetroactionSpy = spyOn(component as any, 'correctRetroaction').and.callFake(() => {
            return;
        });
        const errorRetroactionSpy = spyOn(component as any, 'errorRetroaction').and.callFake(() => {
            return;
        });
        const differenceTry: DifferenceTry = { validated: true, differencePos: { x: 0, y: 0 }, username: 'Test' };
        component.ngAfterViewInit();
        classicModeService.serverValidateResponse$.next(differenceTry);
        expect(serverValidateResponseSpy).toHaveBeenCalled();
        expect(correctRetroactionSpy).toHaveBeenCalledWith(differenceTry.differencePos);
        expect(errorRetroactionSpy).not.toHaveBeenCalled();
    });

    it('should react accordingly on invalid response from server', () => {
        const serverValidateResponseSpy = spyOn((component as any).classicModeService.serverValidateResponse$, 'subscribe').and.callThrough();
        const correctRetroactionSpy = spyOn(component as any, 'correctRetroaction').and.callFake(() => {
            return;
        });
        const errorRetroactionSpy = spyOn(component as any, 'errorRetroaction').and.callFake(() => {
            return;
        });
        const differenceTry: DifferenceTry = { validated: false, differencePos: { x: 0, y: 0 }, username: 'Test' };
        (component as any).classicModeService.username = differenceTry.username;
        component.ngAfterViewInit();
        classicModeService.serverValidateResponse$.next(differenceTry);
        expect(serverValidateResponseSpy).toHaveBeenCalled();
        expect(correctRetroactionSpy).not.toHaveBeenCalled();
        expect(errorRetroactionSpy).toHaveBeenCalledWith((component as any).canvasClicked);
    });

    it('should correctly set the variables if the desired gameRoom exists', () => {
        (component as any).classicModeService.gameRoom = gameRoom;
        component.gameRoom = gameRoom;
        component.ngOnChanges();
        expect((component as any).differenceMatrix).toEqual(differenceMatrix);
        expect((component as any).original.src).not.toEqual('');
        expect((component as any).modified.src).not.toEqual('');
    });

    it('correctRetroaction should call audio play and pause and correctAnswerVisuals ', () => {
        (component as any).playerIsAllowedToClick = true;
        spyOn(component as any, 'correctAnswerVisuals');
        spyOn((component as any).audioValid, 'pause');
        spyOn((component as any).audioValid, 'play');

        (component as any).correctRetroaction({ x: 1, y: 2 });
        expect((component as any).playerIsAllowedToClick).toBeFalsy();
        expect((component as any).correctAnswerVisuals).toHaveBeenCalledWith({ x: 1, y: 2 });
        expect((component as any).audioValid.pause).toHaveBeenCalled();
        expect((component as any).audioValid.currentTime).toEqual(0);
        expect((component as any).audioValid.play).toHaveBeenCalled();
    });

    // TODO: to fix
    // it('errorRetroaction should call audio play and errorAnswerVisuals ', () => {
    //     (component as any).playerIsAllowedToClick = true;
    //     spyOn(component as any, 'errorAnswerVisuals').and.callFake(() => {
    //         return;
    //     });
    //     spyOn((component as any).audioInvalid, 'play');

    //     (component as any).errorRetroaction((component as any).canvasClicked);
    //     expect((component as any).playerIsAllowedToClick).toBeFalsy();
    //     expect((component as any).errorAnswerVisuals).toHaveBeenCalledWith((component as any).canvasClicked);
    //     expect((component as any).audioInvalid.play).toHaveBeenCalled();
    // });

    it("should change differenceMatrix, original, modified source if gameRoom isn't undefined", () => {
        component.gameRoom = gameRoom;
        (component as any).classicModeService.gameRoom = gameRoom;
        component.ngOnChanges();

        expect((component as any).differenceMatrix).toEqual(gameRoom.userGame.gameData.differenceMatrix);
        expect((component as any).original.src).toContain(gameRoom.userGame.gameData.gameForm.image1url);
        expect((component as any).modified.src).toContain(gameRoom.userGame.gameData.gameForm.image2url);
    });

    it("shouldn't change differenceMatrix, original, modified source if gameRoom is undefined", () => {
        component.gameRoom = undefined as unknown as GameRoom;
        (component as any).original.src = 'https://picsum.photos/id/88/200/300';
        (component as any).modified.src = 'https://picsum.photos/id/88/200/300';
        (component as any).classicModeService.gameRoom = gameRoom;
        component.ngOnChanges();
        expect((component as any).differenceMatrix).toEqual(undefined as unknown as number[][]);
        expect((component as any).original.src).toContain('https://picsum.photos/id/88/200/300');
        expect((component as any).modified.src).toContain('https://picsum.photos/id/88/200/300');
    });

    // TODO: fix
    // it('verifyDifferenceMatrix should call createAndFillNewLayer', () => {
    //     spyOn(component as any, 'createAndFillNewLayer').and.callFake(() => {
    //         return;
    //     });
    //     (component as any).verifyDifferenceMatrix('cheat');
    //     expect((component as any).createAndFillNewLayer).toHaveBeenCalled();
    // });
});
