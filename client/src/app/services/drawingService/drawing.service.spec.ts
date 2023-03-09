/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ChildrenOutletContexts, DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawModes } from '@app/interfaces/creation-game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DrawingService } from '@app/services/drawingService/drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let component: CreationGamePageComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule, RouterModule, RouterTestingModule],
            providers: [CommunicationService, { provide: UrlSerializer, useClass: DefaultUrlSerializer }, ChildrenOutletContexts],
        });
        service = TestBed.inject(DrawingService);
        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        service.component = component;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createNewCanvas should create a new canvas', () => {
        const width = 640;
        const height = 480;
        const spy = spyOn(service, 'createNewCanvas').and.callThrough();
        const canvas = service.createNewCanvas();
        expect(spy).toHaveBeenCalled();
        expect(canvas.width).toEqual(width);
        expect(canvas.height).toEqual(height);
    });

    it('drawRectangle should draw a rectangle if shift is not pressed', () => {
        const pos = { x: 13, y: 12 };
        service.component.shiftPressed = false;
        service.component.rectangleState = {
            canvas: service.component.canvas1.nativeElement,
            context: service.component.context1,
            startPos: { x: 0, y: 0 },
        };
        const spyFillRect = spyOn(service.component.rectangleState.context, 'fillRect');
        const spyDrawImage = spyOn(service.component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        service.drawRectangle(service.component.context1, pos);
        expect(spyFillRect).toHaveBeenCalledWith(0, 0, pos.x, pos.y);
        expect(spyDrawImage).toHaveBeenCalledTimes(2);
    });

    it('drawRectangle should draw a square if shift is pressed', () => {
        const pos = { x: 13, y: 12 };
        const value = 4;
        service.component.shiftPressed = true;
        const spyDrawImage = spyOn(service.component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        service.component.rectangleState = {
            canvas: service.component.canvas1.nativeElement,
            context: service.component.context1,
            startPos: { x: 0, y: 0 },
        };
        service.drawRectangle(service.component.context1, pos);
        service.component.rectangleState = {
            canvas: service.component.canvas1.nativeElement,
            context: service.component.context1,
            startPos: { x: 31, y: 21 },
        };
        service.drawRectangle(service.component.context1, pos);
        expect(spyDrawImage).toHaveBeenCalledTimes(value);
    });

    it('should draw rectangle and update canvas', () => {
        const spy1 = spyOn(service, 'drawRectangle');
        const spy2 = spyOn(service, 'updateCanvas1Display');
        const spy3 = spyOn(service, 'updateCanvas2Display');
        service.updateRectangle();
        expect(spy1).toHaveBeenCalledWith(service.component.rectangleContext, service.component.mousePosition);
        expect(spy2).toHaveBeenCalled();
        expect(spy3).toHaveBeenCalled();
    });

    it('should call the mousedown event handler', () => {
        const event = new MouseEvent('mousedown');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseDown').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(service, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        const spyPushToUndoStack = spyOn(service, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.handleCanvasEvent('mousedown', event, canvas);
        expect(spy).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
    });

    it('should call the mousemove event handler', () => {
        const event = new MouseEvent('mousemove');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseMove').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.handleCanvasEvent('mousemove', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should call the mouseup event handler', () => {
        const event = new MouseEvent('mouseup');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseUp').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.handleCanvasEvent('mouseup', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should call the mouseleave event handler', () => {
        const event = new MouseEvent('mouseleave');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseLeave').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.handleCanvasEvent('mouseleave', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should call the mouseenter event handler', () => {
        const event = new MouseEvent('mouseenter');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseEnter').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.handleCanvasEvent('mouseenter', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('handleCanvasEvent should change context depending on the canvas', () => {
        const event = new MouseEvent('mouseup');
        const spy = spyOn(service, 'handleMouseUp').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = service.component.canvas2.nativeElement;
        service.handleCanvasEvent('mouseup', event, service.component.canvas2.nativeElement);
        expect(spy).toHaveBeenCalled();
    });

    it('should enable the mode', () => {
        service.component.drawMode = DrawModes.PENCIL;
        service.component.mousePressed = true;
        service.component.enableMode(DrawModes.RECTANGLE);
        expect(service.component.drawMode).toEqual(DrawModes.RECTANGLE);
        expect(service.component.mousePressed).toBeFalse();
    });

    it('should update the display of canvas 1 when there is no background image', () => {
        service.component.urlPath1 = '';
        const spyClearRect = spyOn(service.component.context1, 'clearRect').and.callFake(() => {
            return;
        });
        const spyDrawImage = spyOn(service.component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        service.updateCanvas1Display();
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    });

    it('should update the display of canvas 1 when there is a background image', () => {
        service.component.urlPath1 = 'urlPath';
        const spy = spyOn(service.component, 'updateContext').and.callFake(() => {
            return;
        });
        service.updateCanvas1Display();
        expect(spy).toHaveBeenCalled();
    });

    it('should update the display of canvas 2', () => {
        service.component.urlPath2 = '';
        const spyClearRect = spyOn(service.component.context2, 'clearRect').and.callFake(() => {
            return;
        });
        const spyDrawImage = spyOn(service.component.context2, 'drawImage').and.callFake(() => {
            return;
        });
        service.updateCanvas2Display();
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    });

    it('should update the display of canvas 2 when there is a background image', () => {
        service.component.urlPath2 = 'urlPath';
        const spy = spyOn(service.component, 'updateContext').and.callFake(() => {
            return;
        });
        service.updateCanvas2Display();
        expect(spy).toHaveBeenCalled();
    });

    it('should draw a circle on selected context', () => {
        const blankCanvas = document.createElement('canvas');
        const position = { x: 0, y: 0 };
        const spy = spyOn(service.component.context1, 'arc').and.callThrough();
        service.drawCircle(service.component.context1, position);
        expect(spy).toHaveBeenCalled();
        expect(blankCanvas.toDataURL() === service.component.canvas1.nativeElement.toDataURL()).toBeFalse();
    });

    it('should erase the drawing on selected context', () => {
        const spy = spyOn(service.component.context1, 'clearRect').and.callFake(() => {
            return;
        });
        const position = { x: 0, y: 0 };
        service.eraseSquare(service.component.context1, position);
        expect(spy).toHaveBeenCalled();
    });

    it('drawShape should call drawCircle when the draw mode is Pencil', () => {
        const spy = spyOn(service, 'drawCircle').and.callFake(() => {
            return;
        });
        const position = { x: 0, y: 0 };
        service.component.drawMode = DrawModes.PENCIL;
        service.drawShape(service.component.context1, position);
        expect(spy).toHaveBeenCalled();
    });

    it('drawShape should call eraseSquare when the draw mode is Eraser', () => {
        const spy = spyOn(service, 'eraseSquare').and.callFake(() => {
            return;
        });
        const position = { x: 0, y: 0 };
        service.component.drawMode = DrawModes.ERASER;
        service.drawShape(service.component.context1, position);
        expect(spy).toHaveBeenCalled();
    });

    it('traceShape should call drawShape', () => {
        const spy = spyOn(service, 'drawShape').and.callFake(() => {
            return;
        });
        let start = { x: 0, y: 0 };
        let finish = { x: 10, y: 10 };
        service.traceShape(service.component.context1, start, finish);
        start = { x: 10, y: 10 };
        finish = { x: 0, y: 0 };
        service.traceShape(service.component.context1, start, finish);
        expect(spy).toHaveBeenCalled();
    });

    it('traceShape should update the mouse position', () => {
        const start = { x: 3, y: 12 };
        const finish = { x: 13, y: 12 };
        service.component.mousePosition = { x: 7, y: 9 };
        service.traceShape(service.component.context1, start, finish);
        expect(service.component.mousePosition).toEqual(finish);
    });

    it('should get the canvas 1 and update it', () => {
        const state = { layer: service.component.canvas1.nativeElement, belonging: true, swap: true };
        service.component.canvas1.nativeElement = document.createElement('canvas');
        const spyDrawImage = spyOn(service.component.contextForeground1, 'drawImage').and.callThrough();
        const spyUpdateCanvasDisplay = spyOn(service, 'updateCanvas1Display').and.callFake(() => {
            return;
        });
        service.component.belongsToCanvas1 = false;
        service.getCanvasAndUpdate(state);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyUpdateCanvasDisplay).toHaveBeenCalled();
        expect(service.component.belongsToCanvas1).toBeTrue();
    });

    it('should get the canvas 2 and update it', () => {
        const state = { layer: service.component.canvas2.nativeElement, belonging: false, swap: true };
        service.component.canvas2.nativeElement = document.createElement('canvas');
        const spyDrawImage = spyOn(service.component.contextForeground2, 'drawImage').and.callThrough();
        const spyUpdateCanvasDisplay = spyOn(service, 'updateCanvas2Display').and.callFake(() => {
            return;
        });
        service.component.belongsToCanvas1 = true;
        service.getCanvasAndUpdate(state);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyUpdateCanvasDisplay).toHaveBeenCalled();
        expect(service.component.belongsToCanvas1).toBeFalse();
    });

    it('should push to undo stack for canvas 1', () => {
        service.component.currentCanvas = service.component.canvas1.nativeElement;
        service.component.belongsToCanvas1 = false;
        const spy = spyOn(service.component.undo, 'push').and.callThrough();
        const length = service.component.undo.length;
        service.pushToUndoStack();
        expect(spy).toHaveBeenCalled();
        expect(service.component.belongsToCanvas1).toBeTrue();
        expect(service.component.undo.length).toEqual(length + 1);
    });

    it('should push to undo stack for canvas 2', () => {
        service.component.currentCanvas = service.component.canvas2.nativeElement;
        service.component.belongsToCanvas1 = true;
        const spy = spyOn(service.component.undo, 'push').and.callThrough();
        const length = service.component.undo.length;
        service.pushToUndoStack();
        expect(spy).toHaveBeenCalled();
        expect(service.component.belongsToCanvas1).toBeFalse();
        expect(service.component.undo.length).toEqual(length + 1);
    });

    it('should empty the redo stack', () => {
        const canvas = document.createElement('canvas');
        service.component.redo = [
            { layer: canvas, belonging: true, swap: false },
            { layer: canvas, belonging: false, swap: true },
        ];
        expect(service.component.redo.length).toEqual(2);
        service.emptyRedoStack();
        expect(service.component.redo.length).toEqual(0);
    });

    it('should cancel an event when foregrounds are swapped', () => {
        const canvas = document.createElement('canvas');
        service.component.undo = [{ layer: canvas, belonging: true, swap: true }];
        service.component.redo = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = service.component.redo.length;
        const lengthUndo = service.component.undo.length;
        const spyPush = spyOn(service.component.redo, 'push').and.callThrough();
        const spySwap = spyOn(service.component, 'swapForegrounds').and.callFake(() => {
            return;
        });
        service.ctrlZ();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: true, swap: true });
        expect(spySwap).toHaveBeenCalled();
        expect(service.component.redo.length).toEqual(lengthRedo + 1);
        expect(service.component.undo.length).toEqual(lengthUndo - 1);
    });

    it('should cancel an event when foregrounds are not swapped', () => {
        const canvas = document.createElement('canvas');
        service.component.undo = [{ layer: canvas, belonging: true, swap: false }];
        service.component.redo = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = service.component.redo.length;
        const lengthUndo = service.component.undo.length;
        const spyPush = spyOn(service.component.redo, 'push').and.callThrough();
        const spyCanvasAndUpdate = spyOn(service, 'getCanvasAndUpdate').and.callFake(() => {
            return canvas;
        });
        service.ctrlZ();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: service.component.belongsToCanvas1, swap: false });
        expect(spyCanvasAndUpdate).toHaveBeenCalledWith({ layer: canvas, belonging: true, swap: false });
        expect(service.component.redo.length).toEqual(lengthRedo + 1);
        expect(service.component.undo.length).toEqual(lengthUndo - 1);
    });

    it('should not cancel an event if undo stack is empty', () => {
        service.component.undo = [];
        expect(service.component.undo.length).toEqual(0);
        service.ctrlZ();
        expect(service.component.undo.length).toEqual(0);
    });

    it('should redo an event when foregrounds are swapped ', () => {
        const canvas = document.createElement('canvas');
        service.component.redo = [{ layer: canvas, belonging: true, swap: true }];
        service.component.undo = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = service.component.redo.length;
        const lengthUndo = service.component.undo.length;
        const spyPush = spyOn(service.component.undo, 'push').and.callThrough();
        const spySwap = spyOn(service.component, 'swapForegrounds').and.callFake(() => {
            return;
        });
        service.ctrlShiftZ();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: true, swap: true });
        expect(spySwap).toHaveBeenCalled();
        expect(service.component.redo.length).toEqual(lengthRedo - 1);
        expect(service.component.undo.length).toEqual(lengthUndo + 1);
    });

    it('should redo an event when foregrounds are not swapped ', () => {
        const canvas = document.createElement('canvas');
        service.component.redo = [{ layer: canvas, belonging: true, swap: false }];
        service.component.undo = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = service.component.redo.length;
        const lengthUndo = service.component.undo.length;
        const spyPush = spyOn(service.component.undo, 'push').and.callThrough();
        const spyCanvasAndUpdate = spyOn(service, 'getCanvasAndUpdate').and.callFake(() => {
            return canvas;
        });
        service.ctrlShiftZ();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: service.component.belongsToCanvas1, swap: false });
        expect(spyCanvasAndUpdate).toHaveBeenCalled();
        expect(service.component.redo.length).toEqual(lengthRedo - 1);
        expect(service.component.undo.length).toEqual(lengthUndo + 1);
    });

    it('should not redo an event if redo stack is empty', () => {
        service.component.redo = [];
        expect(service.component.redo.length).toEqual(0);
        service.ctrlShiftZ();
        expect(service.component.redo.length).toEqual(0);
    });

    it('should handle mouseup event', () => {
        service.component.mousePressed = true;
        service.handleMouseUp();
        expect(service.component.mousePressed).toBeFalse();
    });

    it('should handle mouseenter event', () => {
        const event = new MouseEvent('mouseenter');
        service.component.drawMode = DrawModes.PENCIL;
        service.component.mouseInCanvas = false;
        service.handleMouseEnter(event);
        expect(service.component.mouseInCanvas).toBeTrue();
    });

    it('should handle mouseleave event', () => {
        const event = new MouseEvent('mouseleave');
        service.component.mouseInCanvas = true;
        service.component.mousePressed = true;
        service.component.drawMode = DrawModes.PENCIL;
        const spyTraceShape = spyOn(service, 'traceShape').and.callFake(() => {
            return;
        });
        const spyDrawImage = spyOn(service, 'drawRectangle').and.callFake(() => {
            return;
        });
        service.handleMouseLeave(event, service.component.context1);
        service.component.drawMode = DrawModes.RECTANGLE;
        service.handleMouseLeave(event, service.component.context1);
        service.component.mousePressed = false;
        service.handleMouseLeave(event, service.component.context1);
        expect(spyDrawImage).toHaveBeenCalledTimes(1);
        expect(spyTraceShape).toHaveBeenCalledTimes(1);
        expect(service.component.mouseInCanvas).toBeFalse();
    });

    it('should handle mousemove event', () => {
        const event = new MouseEvent('click');
        service.component.canvas1.nativeElement.dispatchEvent(event);
        service.component.mousePressed = true;
        service.component.mouseInCanvas = true;
        const spyTraceShape = spyOn(service, 'traceShape').and.callFake(() => {
            return;
        });
        const spyDrawRectangle = spyOn(service, 'drawRectangle').and.callFake(() => {
            return;
        });
        service.component.drawMode = DrawModes.PENCIL;
        service.handleMouseMove(event, service.component.context1);
        service.component.drawMode = DrawModes.RECTANGLE;
        service.handleMouseMove(event, service.component.context1);
        service.component.drawMode = DrawModes.ERASER;
        service.handleMouseMove(event, service.component.context1);
        expect(spyTraceShape).toHaveBeenCalledTimes(2);
        expect(spyDrawRectangle).toHaveBeenCalledTimes(1);
    });

    it('should handle mousedown event', () => {
        const event = new MouseEvent('click');
        service.component.canvas1.nativeElement.dispatchEvent(event);
        service.component.mousePressed = true;
        service.component.mouseInCanvas = true;
        const spyDrawCircle = spyOn(service, 'drawCircle').and.callFake(() => {
            return;
        });
        const spyEraseSquare = spyOn(service, 'eraseSquare').and.callFake(() => {
            return;
        });
        const spyDrawImage = spyOn(service.component.canvasTemp.context, 'drawImage').and.callFake(() => {
            return;
        });
        service.component.drawMode = DrawModes.PENCIL;
        service.handleMouseDown(event, service.component.contextForeground1);
        service.component.drawMode = DrawModes.RECTANGLE;
        service.handleMouseDown(event, service.component.contextForeground1);
        service.handleMouseDown(event, service.component.contextForeground2);
        service.component.drawMode = DrawModes.ERASER;
        service.handleMouseDown(event, service.component.contextForeground1);
        expect(spyDrawCircle).toHaveBeenCalledTimes(1);
        expect(spyEraseSquare).toHaveBeenCalledTimes(1);
        expect(spyDrawImage).toHaveBeenCalledTimes(2);
    });
});
