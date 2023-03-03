import { TestBed } from '@angular/core/testing';

import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('createNewCanvas should create a new canvas', () => {
    //     const width = 640;
    //     const height = 480;
    //     const spy = spyOn(service, 'createNewCanvas').and.callThrough();
    //     const canvas = service.createNewCanvas();
    //     expect(spy).toHaveBeenCalled();
    //     expect(canvas.width).toEqual(width);
    //     expect(canvas.height).toEqual(height);
    // });

    // it('drawRectangle should draw a rectangle if shift is not pressed', () => {
    //     const canvas = service.createNewCanvas();
    //     const context = canvas.getContext('2d');
    //     const pos = { x: 13, y: 12 };
    //     service.component.shiftPressed = false;
    //     const spy = spyOn(service.component, 'drawRectangle').and.callThrough();
    //     if (context) {
    //         service.component.rectangleState = { canvas, context, startPos: { x: 0, y: 0 } };
    //         const spy2 = spyOn(service.component.rectangleState.context, 'fillRect');
    //         service.component.drawRectangle(context, pos);
    //         expect(spy).toHaveBeenCalled();
    //         expect(spy2).toHaveBeenCalledWith(0, 0, pos.x, pos.y);
    //     }
    // });

    // it('drawRectangle should draw a square if shift is pressed', () => {
    //     const canvas = service.component.createNewCanvas();
    //     const context = canvas.getContext('2d');
    //     const pos = { x: 13, y: 12 };
    //     service.component.shiftPressed = true;
    //     const spy = spyOn(service.component, 'drawRectangle').and.callThrough();
    //     if (context) {
    //         service.component.rectangleState = { canvas, context, startPos: { x: 0, y: 0 } };
    //         const spy2 = spyOn(service.component.rectangleState.context, 'fillRect');
    //         service.component.drawRectangle(context, pos);
    //         expect(spy).toHaveBeenCalled();
    //         expect(spy2).toHaveBeenCalledWith(0, 0, pos.y, pos.y);
    //     }
    // });

    // it('should reset foreground 1', () => {
    //     const spyClearRect = spyOn(service.component.context1, 'clearRect').and.callThrough();
    //     const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
    //         return;
    //     });
    //     const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
    //         return;
    //     });
    //     service.component.canvas1.nativeElement = document.createElement('canvas');
    //     service.component.reset(service.component.canvas1.nativeElement);
    //     expect(spyClearRect).toHaveBeenCalled();
    //     expect(spyPushToUndoStack).toHaveBeenCalled();
    //     expect(spyEmptyRedoStack).toHaveBeenCalled();
    // });

    // it('should reset foreground 2', () => {
    //     const spyClearRect = spyOn(service.component.context2, 'clearRect').and.callThrough();
    //     const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
    //         return;
    //     });
    //     const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
    //         return;
    //     });
    //     service.component.canvas2.nativeElement = document.createElement('canvas');
    //     service.component.reset(service.component.canvas2.nativeElement);
    //     expect(spyClearRect).toHaveBeenCalled();
    //     expect(spyPushToUndoStack).toHaveBeenCalled();
    //     expect(spyEmptyRedoStack).toHaveBeenCalled();
    // });

    // it('should duplicate foreground 1 to foreground 2', () => {
    //     const spyUpdateContext = spyOn(service.component, 'updateContext').and.callThrough();
    //     const spyDrawImage = spyOn(service.component.context2, 'drawImage').and.callThrough();
    //     const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
    //         return;
    //     });
    //     const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
    //         return;
    //     });
    //     service.component.canvas1.nativeElement = document.createElement('canvas');
    //     service.component.duplicateForeground(service.component.canvas1.nativeElement);
    //     expect(spyUpdateContext).toHaveBeenCalledWith(service.component.context2, service.component.canvasForeground2, service.component.urlPath2);
    //     expect(spyDrawImage).toHaveBeenCalled();
    //     expect(spyPushToUndoStack).toHaveBeenCalled();
    //     expect(spyEmptyRedoStack).toHaveBeenCalled();
    // });

    // it('should duplicate foreground 2 to foreground 1', () => {
    //     const spyUpdateContext = spyOn(service.component, 'updateContext').and.callThrough();
    //     const spyDrawImage = spyOn(service.component.context1, 'drawImage').and.callThrough();
    //     const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
    //         return;
    //     });
    //     const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
    //         return;
    //     });
    //     service.component.canvas2.nativeElement = document.createElement('canvas');
    //     service.component.duplicateForeground(service.component.canvas2.nativeElement);
    //     expect(spyUpdateContext).toHaveBeenCalledWith(service.component.context1, service.component.canvasForeground1, service.component.urlPath1);
    //     expect(spyDrawImage).toHaveBeenCalled();
    //     expect(spyPushToUndoStack).toHaveBeenCalled();
    //     expect(spyEmptyRedoStack).toHaveBeenCalled();
    // });

    // it('should swap foregrounds', () => {
    //     const spyUpdateContext = spyOn(service.component, 'updateContext').and.callThrough();
    //     const spyDrawImage1 = spyOn(service.component.context1, 'drawImage').and.callThrough();
    //     const spyDrawImage2 = spyOn(service.component.context2, 'drawImage').and.callThrough();
    //     service.component.swapForegrounds();
    //     expect(spyUpdateContext).toHaveBeenCalledTimes(2);
    //     expect(spyDrawImage1).toHaveBeenCalled();
    //     expect(spyDrawImage2).toHaveBeenCalled();
    // });

    // it('should push and swap foregrounds', () => {
    //     const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
    //         return;
    //     });
    //     const spySwapForeground = spyOn(service.component, 'swapForegrounds').and.callFake(() => {
    //         return;
    //     });
    //     service.component.pushAndSwapForegrounds();
    //     expect(spyEmptyRedoStack).toHaveBeenCalled();
    //     expect(spySwapForeground).toHaveBeenCalled();
    // });

    // it('should handle mousedown event', () => {
    //     const event = new MouseEvent('mousedown');
    //     const canvas = document.createElement('canvas');
    //     const spy = spyOn(service.component, 'handleMouseDown').and.callFake(() => {
    //         return;
    //     });
    //     const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
    //         return;
    //     });
    //     const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
    //         return;
    //     });
    //     service.component.currentCanvas = canvas;
    //     service.component.handleCanvasEvent('mousedown', event, canvas);
    //     expect(spy).toHaveBeenCalled();
    //     expect(spyEmptyRedoStack).toHaveBeenCalled();
    //     expect(spyPushToUndoStack).toHaveBeenCalled();
    // });

    // it('should handle mousemove event', () => {
    //     const event = new MouseEvent('mousemove');
    //     const canvas = document.createElement('canvas');
    //     const spy = spyOn(service.component, 'handleMouseMove').and.callFake(() => {
    //         return;
    //     });
    //     service.component.currentCanvas = canvas;
    //     service.component.handleCanvasEvent('mousemove', event, canvas);
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('should handle mouseup event', () => {
    //     const event = new MouseEvent('mouseup');
    //     const canvas = document.createElement('canvas');
    //     const spy = spyOn(service.component, 'handleMouseUp').and.callFake(() => {
    //         return;
    //     });
    //     service.component.currentCanvas = canvas;
    //     service.component.handleCanvasEvent('mouseup', event, canvas);
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('should handle mouseleave event', () => {
    //     const event = new MouseEvent('mouseleave');
    //     const canvas = document.createElement('canvas');
    //     const spy = spyOn(service.component, 'handleMouseLeave').and.callFake(() => {
    //         return;
    //     });
    //     service.component.currentCanvas = canvas;
    //     service.component.handleCanvasEvent('mouseleave', event, canvas);
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('should handle mouseenter event', () => {
    //     const event = new MouseEvent('mouseenter');
    //     const canvas = document.createElement('canvas');
    //     const spy = spyOn(service.component, 'handleMouseEnter').and.callFake(() => {
    //         return;
    //     });
    //     service.component.currentCanvas = canvas;
    //     service.component.handleCanvasEvent('mouseenter', event, canvas);
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('handleCanvasEvent should change context depending on the canvas', () => {
    //     const event = new MouseEvent('mouseup');
    //     const spy = spyOn(service.component, 'handleMouseUp').and.callFake(() => {
    //         return;
    //     });
    //     service.component.currentCanvas = service.component.canvas2.nativeElement;
    //     service.component.handleCanvasEvent('mouseup', event, service.component.canvas2.nativeElement);
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('should enable the mode', () => {
    //     service.component.drawMode = DrawModes.PENCIL;
    //     service.component.mousePressed = true;
    //     service.component.enableMode(DrawModes.RECTANGLE);
    //     expect(service.component.drawMode).toEqual(DrawModes.RECTANGLE);
    //     expect(service.component.mousePressed).toBeFalse();
    // });

    // it('should update the display of canvas 1 when there is no background image', () => {
    //     service.component.urlPath1 = '';
    //     const spyClearRect = spyOn(service.component.context1, 'clearRect').and.callFake(() => {
    //         return;
    //     });
    //     const spyDrawImage = spyOn(service.component.context1, 'drawImage').and.callFake(() => {
    //         return;
    //     });
    //     service.component.updateCanvas1Display();
    //     expect(spyClearRect).toHaveBeenCalled();
    //     expect(spyDrawImage).toHaveBeenCalled();
    // });

    // it('should update the display of canvas 1 when there is a background image', () => {
    //     service.component.urlPath1 = 'urlPath';
    //     const spy = spyOn(service.component, 'updateContext').and.callFake(() => {
    //         return;
    //     });
    //     service.component.updateCanvas1Display();
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('should update the display of canvas 2', () => {
    //     service.component.urlPath2 = '';
    //     const spyClearRect = spyOn(service.component.context2, 'clearRect').and.callFake(() => {
    //         return;
    //     });
    //     const spyDrawImage = spyOn(service.component.context2, 'drawImage').and.callFake(() => {
    //         return;
    //     });
    //     service.component.updateCanvas2Display();
    //     expect(spyClearRect).toHaveBeenCalled();
    //     expect(spyDrawImage).toHaveBeenCalled();
    // });

    // it('should update the display of canvas 2 when there is a background image', () => {
    //     service.component.urlPath2 = 'urlPath';
    //     const spy = spyOn(service.component, 'updateContext').and.callFake(() => {
    //         return;
    //     });
    //     service.component.updateCanvas2Display();
    //     expect(spy).toHaveBeenCalled();
    // });
});
