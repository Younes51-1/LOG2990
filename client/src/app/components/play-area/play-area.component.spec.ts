/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData, GameRoom, UserGame } from '@app/interfaces/game';
import { ChatService } from '@app/services/chatService/chat.service';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
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
    const gameForm = {
        name: '',
        nbDifference: 0,
        image1url: 'https://picsum.photos/402',
        image2url: 'https://picsum.photos/204',
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
    let chatService: ChatService;

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
        component.correctAnswerVisuals({ x: 1, y: 2 });
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

    it("flashDifference shouldn't call removeDifference if context1 or context2 are null", fakeAsync(() => {
        component.context1 = null as unknown as CanvasRenderingContext2D;
        component.context2 = null as unknown as CanvasRenderingContext2D;
        const spy = spyOn(component, 'removeDifference').and.callFake(() => {
            return;
        });
        component.flashDifference(component.differenceMatrix);
        const timeOut = 1500;
        tick(timeOut);
        expect(spy).not.toHaveBeenCalled();
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

    it('should correctly set totalDifferencesFound variable', () => {
        const testingValue = 5;
        const totalDifferencesFoundSpy = spyOn(component.classicModeService.totalDifferencesFound$, 'subscribe').and.callThrough();
        component.ngAfterViewInit();
        classicModeService.totalDifferencesFound$.next(testingValue);
        expect(totalDifferencesFoundSpy).toHaveBeenCalled();
        expect(component.totalDifferencesFound).toEqual(testingValue);
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
        const correctRetroactionSpy = spyOn(component, 'correctRetroaction').and.callFake(() => {
            return;
        });
        const erreurRetroactionSpy = spyOn(component, 'erreurRetroaction').and.callFake(() => {
            return;
        });
        const differenceTry: DifferenceTry = { validated: true, differencePos: { x: 0, y: 0 }, username: 'Test' };
        component.ngAfterViewInit();
        classicModeService.serverValidateResponse$.next(differenceTry);
        expect(serverValidateResponseSpy).toHaveBeenCalled();
        expect(correctRetroactionSpy).toHaveBeenCalledWith(differenceTry.differencePos);
        expect(erreurRetroactionSpy).not.toHaveBeenCalled();
    });

    it('should react accordingly on invalid response from server', () => {
        const serverValidateResponseSpy = spyOn(component.classicModeService.serverValidateResponse$, 'subscribe').and.callThrough();
        const correctRetroactionSpy = spyOn(component, 'correctRetroaction').and.callFake(() => {
            return;
        });
        const erreurRetroactionSpy = spyOn(component, 'erreurRetroaction').and.callFake(() => {
            return;
        });
        const differenceTry: DifferenceTry = { validated: false, differencePos: { x: 0, y: 0 }, username: 'Test' };
        component.classicModeService.username = differenceTry.username;
        component.ngAfterViewInit();
        classicModeService.serverValidateResponse$.next(differenceTry);
        expect(serverValidateResponseSpy).toHaveBeenCalled();
        expect(correctRetroactionSpy).not.toHaveBeenCalled();
        expect(erreurRetroactionSpy).toHaveBeenCalledWith(component.canvasClicked);
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

    it('should set variables and call cheatMode on press of T', () => {
        const cheatModeSpy = spyOn(component, 'cheatMode');
        const cheatModeKey = 't';
        const buttonEvent = { key: cheatModeKey } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.isCheatModeOn).toBeTrue();
        expect(cheatModeSpy).toHaveBeenCalled();
    });

    it('should call createAndFillNewLayer when in cheatMode', fakeAsync(() => {
        const canvasMock = document.createElement('canvas');
        const canvasContextMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);
        canvasMock.getContext = jasmine.createSpy('getContext').and.returnValue(canvasContextMock);
        const spy = spyOn(component, 'createAndFillNewLayer').and.returnValue(canvasMock);
        component.isCheatModeOn = true;
        component.differenceMatrix = differenceMatrix;
        component.cheatMode();
        const ms = 125;
        tick(ms);
        expect(spy).toHaveBeenCalledTimes(1);
        discardPeriodicTasks();
    }));

    it("shouldn't call createAndFillNewLayer when in cheatMode if context1 or context2 are null", fakeAsync(() => {
        component.context1 = null as unknown as CanvasRenderingContext2D;
        component.context2 = null as unknown as CanvasRenderingContext2D;
        const spy = spyOn(component, 'createAndFillNewLayer').and.callFake(() => {
            return null as unknown as HTMLCanvasElement;
        });
        component.cheatMode();
        const ms = 125;
        tick(ms);
        expect(spy).not.toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should call drawImage 8 times per second on both contexts when in cheatMode', fakeAsync(() => {
        component.differenceMatrix = differenceMatrix;
        component.isCheatModeOn = true;
        component.context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        component.context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const drawImageSpy1 = spyOn(component.context1, 'drawImage');
        const drawImageSpy2 = spyOn(component.context2, 'drawImage');
        component.cheatMode();
        const ms = 1000;
        tick(ms);
        const timesCalled = 8;
        expect(drawImageSpy1).toHaveBeenCalledTimes(timesCalled);
        expect(drawImageSpy2).toHaveBeenCalledTimes(timesCalled);
        discardPeriodicTasks();
    }));

    it('should clearInterval if cheatMode is deactivated', () => {
        component.isCheatModeOn = false;
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        component.cheatMode();
        expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear flashes from canvases if cheatMode is deactivated', () => {
        component.isCheatModeOn = false;
        const context1Spy = spyOn(component.context1, 'drawImage');
        const context2Spy = spyOn(component.context2, 'drawImage');
        component.cheatMode();
        expect(context1Spy).toHaveBeenCalledTimes(1);
        expect(context2Spy).toHaveBeenCalledTimes(1);
    });

    it('should not call cheatMode if player is typing', () => {
        chatService = TestBed.inject(ChatService);
        spyOn(chatService, 'getIsTyping').and.returnValue(true);
        const cheatModeSpy = spyOn(component, 'cheatMode');
        const cheatModeKey = 't';
        const buttonEvent = { key: cheatModeKey } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(cheatModeSpy).not.toHaveBeenCalled();
    });

    // TODO: Coralie should change tests description
    it('correctRetroaction should call shit ', () => {
        component.playerIsAllowedToClick = true;
        spyOn(component, 'correctAnswerVisuals');
        spyOn(component.audioValid, 'pause');
        spyOn(component.audioValid, 'play');

        component.correctRetroaction({ x: 1, y: 2 });
        expect(component.playerIsAllowedToClick).toBeFalsy();
        expect(component.correctAnswerVisuals).toHaveBeenCalledWith({ x: 1, y: 2 });
        expect(component.audioValid.pause).toHaveBeenCalled();
        expect(component.audioValid.currentTime).toEqual(0);
        expect(component.audioValid.play).toHaveBeenCalled();
    });

    it('should return an layer when context is null', () => {
        spyOn(window.HTMLCanvasElement.prototype, 'getContext').and.callFake(() => {
            return null;
        });
        const result = document.createElement('canvas');
        result.width = component.width;
        result.height = component.height;
        expect(component.createAndFillNewLayer(Color.Cheat, true, differenceMatrix)).toEqual(result);
    });

    it("should change differenceMartix, original, modified source if gameRoom isn't undefined", () => {
        component.gameRoom = gameRoom;
        component.classicModeService.gameRoom = gameRoom;
        component.ngOnChanges();

        expect(component.differenceMatrix).toEqual(gameRoom.userGame.gameData.differenceMatrix);
        expect(component.original.src).toContain(gameRoom.userGame.gameData.gameForm.image1url);
        expect(component.modified.src).toContain(gameRoom.userGame.gameData.gameForm.image2url);
    });

    it("shouldn't change differenceMartix, original, modified source if gameRoom is undefined", () => {
        component.gameRoom = undefined as unknown as GameRoom;
        component.original.src = 'https://picsum.photos/id/88/200/300';
        component.modified.src = 'https://picsum.photos/id/88/200/300';
        component.classicModeService.gameRoom = gameRoom;
        component.ngOnChanges();
        expect(component.differenceMatrix).toEqual(undefined as unknown as number[][]);
        expect(component.original.src).toContain('https://picsum.photos/id/88/200/300');
        expect(component.modified.src).toContain('https://picsum.photos/id/88/200/300');
    });

    it('should call handleImageLoad when original image is loaded', (done) => {
        const handleImageLoadSpy = spyOn(component, 'handleImageLoad').and.callFake(() => {
            return;
        });
        component.original.src = 'https://picsum.photos/id/88/200/300';
        component.ngOnChanges();
        component.original.dispatchEvent(new Event('load'));
        setTimeout(() => {
            expect(handleImageLoadSpy).toHaveBeenCalledWith(component.context1, component.original);
            done();
        }, 0);
    });

    it('should call handleImageLoad when modified image is loaded', (done) => {
        const handleImageLoadSpy = spyOn(component, 'handleImageLoad').and.callFake(() => {
            return;
        });
        component.modified.src = 'https://picsum.photos/id/88/200/300';
        component.ngOnChanges();
        component.modified.dispatchEvent(new Event('load'));
        setTimeout(() => {
            expect(handleImageLoadSpy).toHaveBeenCalledWith(component.context2, component.modified);
            done();
        }, 0);
    });
});
