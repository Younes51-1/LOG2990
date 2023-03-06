import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData, UserGame, GameRoom } from '@app/interfaces/game';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';

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
        image1url: 'original',
        image2url: 'modified',
        difficulte: '',
        soloBestTimes: [],
        vsBestTimes: [],
    };
    const gameData: GameData = { gameForm, differenceMatrix };
    const userGame: UserGame = { username1: '', gameData, nbDifferenceFound: 0, timer: 0 };
    const gameRoom: GameRoom = { userGame, roomId: 'testRoom', started: false };

    let component: PlayAreaComponent;
    let classicModeService: ClassicModeService;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let detectionDifferenceService: DetectionDifferenceService;
    // eslint-disable-next-line @typescript-eslint/ban-types
    let imageOnload: Function | null = null;

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
        expect(component.buttonPressed).toEqual(expectedKey);
    });

    it('should draw ERREUR on canvas1', () => {
        const textDimensions = { x: 50, y: 30 };
        component.context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const spy = spyOn(component.context1, 'fillText');
        component.visualRetroaction(component.canvas1.nativeElement);
        expect(spy).toHaveBeenCalledWith(
            'ERREUR',
            component.mousePosition.x - textDimensions.x / 2,
            component.mousePosition.y + textDimensions.y / 2,
            textDimensions.x,
        );
    });

    it('should draw ERREUR on canvas2', () => {
        const textDimensions = { x: 50, y: 30 };
        component.context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const spy = spyOn(component.context2, 'fillText');
        component.visualRetroaction(component.canvas2.nativeElement);
        expect(spy).toHaveBeenCalledWith(
            'ERREUR',
            component.mousePosition.x - textDimensions.x / 2,
            component.mousePosition.y + textDimensions.y / 2,
            textDimensions.x,
        );
    });

    it('should make ERREUR disappear after 1 second on canvas1', fakeAsync(() => {
        component.context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const spy = spyOn(component.context1, 'drawImage');
        component.visualRetroaction(component.canvas1.nativeElement);
        const ms = 1000;
        tick(ms);
        expect(spy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeTruthy();
    }));

    it('should make ERREUR disappear after 1 second on canvas2', fakeAsync(() => {
        component.context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        component.differenceMatrix = differenceMatrix;
        component.original.src = userGame.gameData.gameForm.image1url;
        component.modified.src = userGame.gameData.gameForm.image2url;

        const spy = spyOn(component.context2, 'drawImage');
        component.visualRetroaction(component.canvas2.nativeElement);
        const ms = 1000;
        tick(ms);
        expect(spy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeTruthy();
    }));

    it('correctAnswerVisuals should call flashDifference', () => {
        component.differenceMatrix = createAndPopulateMatrix(1);
        const spyFlashDifferent = spyOn(component, 'flashDifference').and.callFake(() => {
            return;
        });
        detectionDifferenceService = TestBed.inject(DetectionDifferenceService);
        const spyExtractDiff = spyOn(detectionDifferenceService, 'extractDifference').and.callFake(() => {
            return component.differenceMatrix;
        });
        component.correctAnswerVisuals(1, 2);
        expect(spyFlashDifferent).toHaveBeenCalled();
        expect(spyExtractDiff).toHaveBeenCalled();
    });

    it('mouseClickAttempt should validate the attempt with the server', fakeAsync(async () => {
        component.playerIsAllowedToClick = true;
        component.differenceMatrix = createAndPopulateMatrix(1);
        const mockClick = new MouseEvent('mousedown');
        const spy = spyOn(component.classicModeService, 'validateDifference').and.callFake(() => {
            return;
        });
        await component.mouseClickAttempt(mockClick, component.canvas1.nativeElement);
        expect(spy).toHaveBeenCalled();
    }));

    it('mouseClickAttempt should call the visual retroaction for a mistake', fakeAsync(async () => {
        component.playerIsAllowedToClick = true;
        component.differenceMatrix = createAndPopulateMatrix(invalidPixelValue);
        const mockClick = new MouseEvent('mousedown');
        const spyVisualRetroaction = spyOn(component, 'visualRetroaction').and.callFake(() => {
            return;
        });
        const spyAudio = spyOn(component.audioInvalid, 'play');
        await component.mouseClickAttempt(mockClick, component.canvas1.nativeElement);
        expect(spyVisualRetroaction).toHaveBeenCalled();
        expect(spyAudio).toHaveBeenCalled();
    }));

    it('flashDifference should call removeDifference', fakeAsync(() => {
        component.canvas1.nativeElement = document.createElement('canvas');
        component.canvas2.nativeElement = document.createElement('canvas');
        component.context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        component.context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        component.differenceMatrix = createAndPopulateMatrix(1);
        component.playerIsAllowedToClick = false;
        const spy = spyOn(component, 'removeDifference').and.callFake(() => {
            return;
        });
        component.flashDifference(component.differenceMatrix);
        const timeOut = 1500;
        tick(timeOut);
        expect(spy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeTruthy();
    }));

    it('removeDifference should update the differenceMatrix', () => {
        component.canvas1.nativeElement = document.createElement('canvas');
        component.canvas2.nativeElement = document.createElement('canvas');
        component.context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        component.context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const newDifferenceMatrix = createAndPopulateMatrix(invalidPixelValue);
        component.differenceMatrix = newDifferenceMatrix;
        component.differenceMatrix[0][2] = 1;
        component.removeDifference(component.differenceMatrix);
        expect(component.differenceMatrix).toEqual(newDifferenceMatrix);
    });

    it('should correctly set the differenceFound variable', () => {
        const testingValue = 5;
        const differenceFoundSpy = spyOn(component.classicModeService.userDifferencesFound$, 'subscribe').and.callThrough();
        component.ngAfterViewInit();
        classicModeService.userDifferencesFound$.next(testingValue);
        expect(differenceFoundSpy).toHaveBeenCalled();
        expect(component.userDifferencesFound).toEqual(testingValue);
    });

    it('should react accordingly on validated response from the server', () => {
        const serverValidateResponseSpy = spyOn(component.classicModeService.serverValidateResponse$, 'subscribe').and.callThrough();
        const correctAnswerVisualsSpy = spyOn(component, 'correctAnswerVisuals').and.callFake(() => {
            return;
        });
        const pauseSpy = spyOn(component.audioValid, 'pause').and.callFake(() => {
            return;
        });
        const playSpy = spyOn(component.audioValid, 'play').and.callFake(async () => {
            return;
        });
        const differenceTry: DifferenceTry = { validated: true, differencePos: { x: 0, y: 0 }, username: 'Test' };
        classicModeService.serverValidateResponse$.next(differenceTry);
        component.ngAfterViewInit();
        expect(serverValidateResponseSpy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeFalse();
        expect(correctAnswerVisualsSpy).toHaveBeenCalledOnceWith(component.mousePosition.x, component.mousePosition.y);
        expect(pauseSpy).toHaveBeenCalled();
        expect(playSpy).toHaveBeenCalled();
    });

    it('should react accordingly on invalid response from server', () => {
        const serverValidateResponseSpy = spyOn(component.classicModeService.serverValidateResponse$, 'subscribe').and.callThrough();
        const playSpy = spyOn(component.audioInvalid, 'play').and.callFake(async () => {
            return;
        });
        const visualRetroactionSpy = spyOn(component, 'visualRetroaction').and.callFake(() => {
            return;
        });
        const differenceTry: DifferenceTry = { validated: false, differencePos: { x: 0, y: 0 }, username: 'Test' };
        classicModeService.serverValidateResponse$.next(differenceTry);
        component.ngAfterViewInit();
        expect(component.playerIsAllowedToClick).toBeFalse();
        expect(serverValidateResponseSpy).toHaveBeenCalled();
        expect(playSpy).toHaveBeenCalled();
        expect(visualRetroactionSpy).toHaveBeenCalledOnceWith(component.canvasClicked);
    });

    it('should correctly set the variables if the desired gameRoom exists', () => {
        component.classicModeService.gameRoom = gameRoom;
        component.gameRoom = gameRoom;
        component.ngOnChanges();
        expect(component.differenceMatrix).toEqual(differenceMatrix);
        expect(component.original.src).not.toEqual('');
        expect(component.modified.src).not.toEqual('');
    });

    it('should redraw the original image on changes', () => {
        component.ngOnChanges();
        spyOn(component.context1, 'drawImage');
        component.handleImageLoad(component.context1, component.original);
        expect(component.context1.drawImage).toHaveBeenCalled();
    });

    it('should redraw the modified image on changes', () => {
        component.ngOnChanges();
        spyOn(component.context2, 'drawImage');
        component.handleImageLoad(component.context2, component.modified);
        expect(component.context2.drawImage).toHaveBeenCalled();
    });

    it('should call handleImageLoad on changes', () => {
        const spy = spyOn(component, 'handleImageLoad').and.callFake(() => {
            return;
        });

        Object.defineProperty(Image.prototype, 'onload', {
            get() {
                // eslint-disable-next-line no-underscore-dangle
                return this._onload;
            },
            // eslint-disable-next-line @typescript-eslint/ban-types
            set(onload: Function) {
                imageOnload = onload;
                // eslint-disable-next-line no-underscore-dangle
                this._onload = onload;
            },
        });

        component.ngOnChanges();
        if (imageOnload !== null) {
            imageOnload();
        }
        expect(spy).toHaveBeenCalled();
    });
});
