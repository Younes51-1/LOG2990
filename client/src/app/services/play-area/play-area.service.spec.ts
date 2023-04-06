import { TestBed } from '@angular/core/testing';

import { PlayAreaService } from './play-area.service';

describe('PlayAreaService', () => {
    let service: PlayAreaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayAreaService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // TODO OLD PLAY AREA TESTS

    // it('should call handleImageLoad when original image is loaded', (done) => {
    //     const handleImageLoadSpy = spyOn(component as unknown, 'handleImageLoad').and.callFake(() => {
    //         return;
    //     });
    //     (component as unknown).original.src = 'https://picsum.photos/id/88/200/300';
    //     component.ngOnChanges();
    //     (component as unknown).original.dispatchEvent(new Event('load'));
    //     setTimeout(() => {
    //         expect(handleImageLoadSpy).toHaveBeenCalledWith((component as unknown).context1, (component as unknown).original);
    //         done();
    //     }, 0);
    // });

    // it('should draw ERREUR on canvas1', () => {
    //     const textDimensions = { x: 76, y: 30 };
    //     (component as unknown).context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     const spy = spyOn((component as unknown).context1, 'fillText');
    //     (component as unknown).errorAnswerVisuals(component.canvas1.nativeElement);
    //     expect(spy).toHaveBeenCalledWith(
    //         'ERREUR',
    //         (component as unknown).mousePosition.x - textDimensions.x / 2,
    //         (component as unknown).mousePosition.y + textDimensions.y / 2,
    //         textDimensions.x,
    //     );
    // });

    // it('should draw ERREUR on canvas2', () => {
    //     const textDimensions = { x: 76, y: 30 };
    //     (component as unknown).context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     const spy = spyOn((component as unknown).context2, 'fillText');
    //     (component as unknown).errorAnswerVisuals(component.canvas2.nativeElement);
    //     expect(spy).toHaveBeenCalledWith(
    //         'ERREUR',
    //         (component as unknown).mousePosition.x - textDimensions.x / 2,
    //         (component as unknown).mousePosition.y + textDimensions.y / 2,
    //         textDimensions.x,
    //     );
    // });

    // it('should make ERREUR disappear after 1 second on canvas1', fakeAsync(() => {
    //     (component as unknown).context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     const spy = spyOn((component as unknown).context1, 'drawImage');
    //     (component as unknown).errorAnswerVisuals(component.canvas1.nativeElement);
    //     const ms = 1000;
    //     tick(ms);
    //     expect(spy).toHaveBeenCalled();
    //     expect((component as unknown).playerIsAllowedToClick).toBeTruthy();
    // }));

    // it('should make ERREUR disappear after 1 second on canvas2', fakeAsync(() => {
    //     (component as unknown).context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     (component as unknown).differenceMatrix = differenceMatrix;
    //     (component as unknown).original.src = userGame.gameData.gameForm.image1url;
    //     (component as unknown).modified.src = userGame.gameData.gameForm.image2url;

    //     const spy = spyOn((component as unknown).context2, 'drawImage');
    //     (component as unknown).errorAnswerVisuals(component.canvas2.nativeElement);
    //     const ms = 1000;
    //     tick(ms);
    //     expect(spy).toHaveBeenCalled();
    //     expect((component as unknown).playerIsAllowedToClick).toBeTruthy();
    // }));

    // it('correctAnswerVisuals should call flashDifference', () => {
    //     (component as unknown).differenceMatrix = createAndPopulateMatrix(1);
    //     const spyFlashDifferent = spyOn(component as unknown, 'flashDifference').and.callFake(() => {
    //         return;
    //     });
    //     detectionDifferenceService = TestBed.inject(DetectionDifferenceService);
    //     const spyExtractDiff = spyOn(detectionDifferenceService, 'extractDifference').and.callFake(() => {
    //         return (component as unknown).differenceMatrix;
    //     });
    //     (component as unknown).correctAnswerVisuals({ x: 1, y: 2 });
    //     expect(spyFlashDifferent).toHaveBeenCalled();
    //     expect(spyExtractDiff).toHaveBeenCalled();
    // });

    // it('flashDifference should call removeDifference', fakeAsync(() => {
    //     component.canvas1.nativeElement = document.createElement('canvas');
    //     component.canvas2.nativeElement = document.createElement('canvas');
    //     (component as unknown).context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     (component as unknown).context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     (component as unknown).differenceMatrix = createAndPopulateMatrix(1);
    //     (component as unknown).playerIsAllowedToClick = false;
    //     const spy = spyOn(component as unknown, 'removeDifference').and.callFake(() => {
    //         return;
    //     });
    //     (component as unknown).flashDifference((component as unknown).differenceMatrix);
    //     const timeOut = 1500;
    //     tick(timeOut);
    //     expect(spy).toHaveBeenCalled();
    //     expect((component as unknown).playerIsAllowedToClick).toBeTruthy();
    // }));

    // it("flashDifference shouldn't call removeDifference if context1 or context2 are null", fakeAsync(() => {
    //     (component as unknown).context1 = null as unknown as CanvasRenderingContext2D;
    //     (component as unknown).context2 = null as unknown as CanvasRenderingContext2D;
    //     const spy = spyOn(component as unknown, 'removeDifference').and.callFake(() => {
    //         return;
    //     });
    //     (component as unknown).flashDifference((component as unknown).differenceMatrix);
    //     const timeOut = 1500;
    //     tick(timeOut);
    //     expect(spy).not.toHaveBeenCalled();
    //     expect((component as unknown).playerIsAllowedToClick).toBeTruthy();
    // }));

    // it('removeDifference should update the differenceMatrix', () => {
    //     component.canvas1.nativeElement = document.createElement('canvas');
    //     component.canvas2.nativeElement = document.createElement('canvas');
    //     (component as unknown).context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     (component as unknown).context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     const newDifferenceMatrix = createAndPopulateMatrix(invalidPixelValue);
    //     (component as unknown).differenceMatrix = newDifferenceMatrix;
    //     (component as unknown).differenceMatrix[0][2] = 1;
    //     (component as unknown).removeDifference((component as unknown).differenceMatrix);
    //     expect((component as unknown).differenceMatrix).toEqual(newDifferenceMatrix);
    // });

    // it('should redraw the original image on changes', () => {
    //     component.ngOnChanges();
    //     spyOn((component as unknown).context1, 'drawImage');
    //     (component as unknown).handleImageLoad((component as unknown).context1, (component as unknown).original);
    //     expect((component as unknown).context1.drawImage).toHaveBeenCalled();
    // });

    // it('should redraw the modified image on changes', () => {
    //     component.ngOnChanges();
    //     spyOn((component as unknown).context2, 'drawImage');
    //     (component as unknown).handleImageLoad((component as unknown).context2, (component as unknown).modified);
    //     expect((component as unknown).context2.drawImage).toHaveBeenCalled();
    // });

    // it('should return a layer when context is null', () => {
    //     spyOn(window.HTMLCanvasElement.prototype, 'getContext').and.callFake(() => {
    //         return null;
    //     });
    //     const result = document.createElement('canvas');
    //     result.width = component.width;
    //     result.height = component.height;
    //     expect((component as unknown).createAndFillNewLayer(Color.Cheat, true, differenceMatrix)).toEqual(result);
    // });

    // it('should set context for context1 and context2 after calling setContexts', () => {
    //     (component as unknown).setContexts();
    //     expect((component as unknown).context1).toEqual((component as unknown).canvas1.nativeElement.getContext('2d'));
    //     expect((component as unknown).context2).toEqual((component as unknown).canvas2.nativeElement.getContext('2d'));
    //     expect((component as unknown).context1.font).toEqual('50px MarioFont');
    //     expect((component as unknown).context2.font).toEqual('50px MarioFont');
    // });

    // it('createAndFillNewLayer should return a canvas with the correct size', () => {
    //     const result = document.createElement('canvas');
    //     result.width = component.width;
    //     result.height = component.height;
    //     expect((component as unknown).createAndFillNewLayer(Color.Cheat, true, false, differenceMatrix)).toEqual(result);
    // });

    // it('should call handleImageLoad when modified image is loaded', (done) => {
    //     const handleImageLoadSpy = spyOn(component as unknown, 'handleImageLoad').and.callFake(() => {
    //         return;
    //     });
    //     (component as unknown).modified.src = 'https://picsum.photos/id/88/200/300';
    //     component.ngOnChanges();
    //     (component as unknown).modified.dispatchEvent(new Event('load'));
    //     setTimeout(() => {
    //         expect(handleImageLoadSpy).toHaveBeenCalledWith((component as unknown).context2, (component as unknown).modified);
    //         done();
    //     }, 0);
    // });

    // TODO OLD HELP SERVICE TESTS

    //   it('should create a canvas element when given coordinates', () => {
    //     const canvas = document.createElement('canvas');
    //     spyOn(canvas, 'getContext').and.callThrough();
    //     spyOn(document, 'createElement').and.returnValue(canvas);
    //     service.startConfetti({ x: 100, y: 200 });
    //     // eslint-disable-next-line deprecation/deprecation
    //     expect(document.createElement).toHaveBeenCalledWith('canvas');
    //     expect(canvas.getContext).toHaveBeenCalledWith('2d');
    // });

    // it('should set variables and call cheatMode on press of T', () => {
    //     const cheatModeSpy = spyOn(service as any, 'cheatMode');
    //     const cheatModeKey = 't';
    //     const buttonEvent = { key: cheatModeKey } as KeyboardEvent;
    //     component.buttonDetect(buttonEvent);
    //     expect((service as any).isCheatModeOn).toBeTrue();
    //     expect(cheatModeSpy).toHaveBeenCalled();
    // });

    // it('should not call cheatMode if player is typing', () => {
    //     chatService = TestBed.inject(ChatService);
    //     spyOn(chatService, 'getIsTyping').and.returnValue(true);
    //     const cheatModeSpy = spyOn(service as any, 'cheatMode');
    //     const cheatModeKey = 't';
    //     const buttonEvent = { key: cheatModeKey } as KeyboardEvent;
    //     component.buttonDetect(buttonEvent);
    //     expect(cheatModeSpy).not.toHaveBeenCalled();
    // });

    // it("shouldn't call createAndFillNewLayer when in cheatMode if context1 or context2 are null", fakeAsync(() => {
    //     (component as any).context1 = null as unknown as CanvasRenderingContext2D;
    //     (component as any).context2 = null as unknown as CanvasRenderingContext2D;
    //     const spy = spyOn(component as any, 'createAndFillNewLayer').and.callFake(() => {
    //         return null as unknown as HTMLCanvasElement;
    //     });
    //     (service as any).isCheatModeOn = true;
    //     (service as any).cheatMode();
    //     const ms = 125;
    //     tick(ms);
    //     expect(spy).not.toHaveBeenCalled();
    //     discardPeriodicTasks();
    // }));

    // it('should call drawImage 8 times per second on both contexts when in cheatMode', fakeAsync(() => {
    //     (component as any).differenceMatrix = differenceMatrix;
    //     (service as any).isCheatModeOn = true;
    //     (component as any).context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     (component as any).context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    //     const drawImageSpy1 = spyOn((component as any).context1, 'drawImage');
    //     const drawImageSpy2 = spyOn((component as any).context2, 'drawImage');
    //     (service as any).cheatMode();
    //     const ms = 1000;
    //     tick(ms);
    //     const timesCalled = 8;
    //     expect(drawImageSpy1).toHaveBeenCalledTimes(timesCalled);
    //     expect(drawImageSpy2).toHaveBeenCalledTimes(timesCalled);
    //     discardPeriodicTasks();
    // }));

    // it('should clearInterval if cheatMode is deactivated', () => {
    //     (service as any).isCheatModeOn = false;
    //     const clearIntervalSpy = spyOn(window, 'clearInterval');
    //     (service as any).cheatMode();
    //     expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    // });

    // it('should clear flashes from canvases if cheatMode is deactivated', () => {
    //     (service as any).isCheatModeOn = false;
    //     const context1Spy = spyOn((component as any).context1, 'drawImage');
    //     const context2Spy = spyOn((component as any).context2, 'drawImage');
    //     (service as any).cheatMode();
    //     expect(context1Spy).toHaveBeenCalledTimes(1);
    //     expect(context2Spy).toHaveBeenCalledTimes(1);
    // });

    // it('should call createAndFillNewLayer when in cheatMode', fakeAsync(() => {
    //     const canvasMock = document.createElement('canvas');
    //     const canvasContextMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);
    //     canvasMock.getContext = jasmine.createSpy('getContext').and.returnValue(canvasContextMock);
    //     const spy = spyOn(component as any, 'createAndFillNewLayer').and.returnValue(canvasMock);
    //     (service as any).isCheatModeOn = true;
    //     (component as any).differenceMatrix = differenceMatrix;
    //     (service as any).cheatMode();
    //     const ms = 125;
    //     tick(ms);
    //     expect(spy).toHaveBeenCalledTimes(1);
    //     discardPeriodicTasks();
});
