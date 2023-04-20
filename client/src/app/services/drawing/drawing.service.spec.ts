/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { ChildrenOutletContexts, DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawModes } from '@app/interfaces/creation-game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let component: CreationGamePageComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CreationGamePageComponent],
            imports: [BrowserModule, CommonModule, HttpClientTestingModule, MatDialogModule, RouterModule, RouterTestingModule],
            providers: [CommunicationHttpService, { provide: UrlSerializer, useClass: DefaultUrlSerializer }, ChildrenOutletContexts],
        });
        service = TestBed.inject(DrawingService);
        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        (service as any).component = component;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set creation game page as component', () => {
        service.setComponent(component);
        expect((service as any).component).toEqual(component);
        expect((service as any).width).toEqual(component.width);
        expect((service as any).height).toEqual(component.height);
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
        (service as any).component.shiftPressed = false;
        (service as any).component.rectangleState = {
            canvas: (service as any).component.canvas1.nativeElement,
            context: (service as any).component.context1,
            startPos: { x: 0, y: 0 },
        };
        const spyFillRect = spyOn((service as any).component.rectangleState.context, 'fillRect');
        const spyDrawImage = spyOn((service as any).component.context1, 'drawImage').and.stub();
        (service as any).drawRectangle((service as any).component.context1, pos);
        expect(spyFillRect).toHaveBeenCalledWith(0, 0, pos.x, pos.y);
        expect(spyDrawImage).toHaveBeenCalledTimes(2);
    });

    it('drawRectangle should draw a square if shift is pressed', () => {
        const pos = { x: 13, y: 12 };
        const value = 4;
        (service as any).component.shiftPressed = true;
        const spyDrawImage = spyOn((service as any).component.context1, 'drawImage').and.stub();
        (service as any).component.rectangleState = {
            canvas: (service as any).component.canvas1.nativeElement,
            context: (service as any).component.context1,
            startPos: { x: 0, y: 0 },
        };
        (service as any).drawRectangle((service as any).component.context1, pos);
        (service as any).component.rectangleState = {
            canvas: (service as any).component.canvas1.nativeElement,
            context: (service as any).component.context1,
            startPos: { x: 31, y: 21 },
        };
        (service as any).drawRectangle((service as any).component.context1, pos);
        expect(spyDrawImage).toHaveBeenCalledTimes(value);
    });

    it('should draw rectangle and update canvas', () => {
        const spy1 = spyOn(service as any, 'drawRectangle');
        const spy2 = spyOn(service as any, 'updateCanvas1Display');
        const spy3 = spyOn(service as any, 'updateCanvas2Display');
        service.updateRectangle();
        expect(spy1).toHaveBeenCalledWith((service as any).component.rectangleContext, (service as any).component.mousePosition);
        expect(spy2).toHaveBeenCalled();
        expect(spy3).toHaveBeenCalled();
    });

    it('should call the mousedown event handler', () => {
        const event = new MouseEvent('mousedown');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service as any, 'handleMouseDown').and.stub();
        const spyEmptyRedoStack = spyOn(service, 'emptyRedoStack').and.stub();
        const spyPushToUndoStack = spyOn(service, 'pushToUndoStack').and.stub();
        (service as any).component.drawMode = DrawModes.RECTANGLE;
        (service as any).component.currentCanvas = canvas;
        service.handleCanvasEvent('mousedown', event, canvas);
        expect(spy).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
    });

    it('should call the mousemove event handler', () => {
        const event = new MouseEvent('mousemove');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service as any, 'handleMouseMove').and.stub();
        (service as any).component.currentCanvas = canvas;
        service.handleCanvasEvent('mousemove', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should call the mouseup event handler', () => {
        const event = new MouseEvent('mouseup');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseUp').and.stub();
        (service as any).component.currentCanvas = canvas;
        service.handleCanvasEvent('mouseup', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should call the mouseleave event handler', () => {
        const event = new MouseEvent('mouseleave');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service as any, 'handleMouseLeave').and.stub();
        (service as any).component.currentCanvas = canvas;
        service.handleCanvasEvent('mouseleave', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should call the mouseenter event handler', () => {
        const event = new MouseEvent('mouseenter');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service as any, 'handleMouseEnter').and.stub();
        (service as any).component.currentCanvas = canvas;
        service.handleCanvasEvent('mouseenter', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('handleCanvasEvent should change context depending on the canvas', () => {
        const event = new MouseEvent('mouseup');
        const spy = spyOn(service, 'handleMouseUp').and.stub();
        (service as any).component.currentCanvas = (service as any).component.canvas2.nativeElement;
        service.handleCanvasEvent('mouseup', event, (service as any).component.canvas2.nativeElement);
        expect(spy).toHaveBeenCalled();
    });

    it('should enable the mode', () => {
        (service as any).component.drawMode = DrawModes.PENCIL;
        (service as any).component.mousePressed = true;
        (service as any).component.enableMode(DrawModes.RECTANGLE);
        expect((service as any).component.drawMode).toEqual(DrawModes.RECTANGLE);
        expect((service as any).component.mousePressed).toBeFalse();
    });

    it('should update the display of canvas 1 when there is no background image', () => {
        (service as any).component.urlPath1 = '';
        const spyFillRect = spyOn((service as any).component.context1, 'fillRect').and.stub();
        const spyDrawImage = spyOn((service as any).component.context1, 'drawImage').and.stub();
        (service as any).updateCanvas1Display();
        expect((service as any).component.context1.fillStyle).toEqual('#ffffff');
        expect(spyFillRect).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    });

    it('should update the display of canvas 1 when there is a background image', () => {
        (service as any).component.urlPath1 = 'urlPath';
        const spy = spyOn((service as any).component, 'updateContext').and.stub();
        (service as any).updateCanvas1Display();
        expect(spy).toHaveBeenCalled();
    });

    it('should update the display of canvas 2', () => {
        (service as any).component.urlPath2 = '';
        const spyFillRect = spyOn((service as any).component.context2, 'fillRect').and.stub();
        const spyDrawImage = spyOn((service as any).component.context2, 'drawImage').and.stub();
        (service as any).updateCanvas2Display();
        expect((service as any).component.context2.fillStyle).toEqual('#ffffff');
        expect(spyFillRect).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    });

    it('should update the display of canvas 2 when there is a background image', () => {
        (service as any).component.urlPath2 = 'urlPath';
        const spy = spyOn((service as any).component, 'updateContext').and.stub();
        (service as any).updateCanvas2Display();
        expect(spy).toHaveBeenCalled();
    });

    it('should draw a circle on selected context', () => {
        const blankCanvas = document.createElement('canvas');
        const position = { x: 0, y: 0 };
        const spy = spyOn((service as any).component.context1, 'arc').and.callThrough();
        (service as any).drawCircle((service as any).component.context1, position);
        expect(spy).toHaveBeenCalled();
        expect(blankCanvas.toDataURL()).not.toEqual((service as any).component.canvas1.nativeElement.toDataURL());
    });

    it('should erase the drawing on selected context', () => {
        const spy = spyOn((service as any).component.context1, 'clearRect').and.stub();
        const position = { x: 0, y: 0 };
        (service as any).eraseSquare((service as any).component.context1, position);
        expect(spy).toHaveBeenCalled();
    });

    it('drawShape should call drawCircle when the draw mode is Pencil', () => {
        const spy = spyOn(service as any, 'drawCircle').and.stub();
        const position = { x: 0, y: 0 };
        (service as any).component.drawMode = DrawModes.PENCIL;
        (service as any).drawShape((service as any).component.context1, position);
        expect(spy).toHaveBeenCalled();
    });

    it('drawShape should call eraseSquare when the draw mode is Eraser', () => {
        const spy = spyOn(service as any, 'eraseSquare').and.stub();
        const position = { x: 0, y: 0 };
        (service as any).component.drawMode = DrawModes.ERASER;
        (service as any).drawShape((service as any).component.context1, position);
        expect(spy).toHaveBeenCalled();
    });

    it('traceShape should call drawShape', () => {
        const spy = spyOn(service as any, 'drawShape').and.stub();
        let start = { x: 0, y: 0 };
        let finish = { x: 10, y: 10 };
        (service as any).traceShape((service as any).component.context1, start, finish);
        start = { x: 10, y: 10 };
        finish = { x: 0, y: 0 };
        (service as any).traceShape((service as any).component.context1, start, finish);
        expect(spy).toHaveBeenCalled();
    });

    it('traceShape should update the mouse position', () => {
        const start = { x: 3, y: 12 };
        const finish = { x: 13, y: 12 };
        (service as any).component.mousePosition = { x: 7, y: 9 };
        (service as any).traceShape((service as any).component.context1, start, finish);
        expect((service as any).component.mousePosition).toEqual(finish);
    });

    it('should get the canvas 1 and update it', () => {
        const state = { layer: (service as any).component.canvas1.nativeElement, belonging: true, swap: true };
        (service as any).component.canvas1.nativeElement = document.createElement('canvas');
        const spyDrawImage = spyOn((service as any).component.contextForeground1, 'drawImage').and.callThrough();
        const spyUpdateCanvasDisplay = spyOn(service as any, 'updateCanvas1Display').and.stub();
        (service as any).component.belongsToCanvas1 = false;
        (service as any).getCanvasAndUpdate(state);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyUpdateCanvasDisplay).toHaveBeenCalled();
        expect((service as any).component.belongsToCanvas1).toBeTrue();
    });

    it('should get the canvas 2 and update it', () => {
        const state = { layer: (service as any).component.canvas2.nativeElement, belonging: false, swap: true };
        (service as any).component.canvas2.nativeElement = document.createElement('canvas');
        const spyDrawImage = spyOn((service as any).component.contextForeground2, 'drawImage').and.callThrough();
        const spyUpdateCanvasDisplay = spyOn(service as any, 'updateCanvas2Display').and.stub();
        (service as any).component.belongsToCanvas1 = true;
        (service as any).getCanvasAndUpdate(state);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyUpdateCanvasDisplay).toHaveBeenCalled();
        expect((service as any).component.belongsToCanvas1).toBeFalse();
    });

    it('should push to undo stack for canvas 1', () => {
        (service as any).component.currentCanvas = (service as any).component.canvas1.nativeElement;
        (service as any).component.belongsToCanvas1 = false;
        const spy = spyOn((service as any).component.previousForegroundStates, 'push').and.callThrough();
        const length = (service as any).component.previousForegroundStates.length;
        service.pushToUndoStack();
        expect(spy).toHaveBeenCalled();
        expect((service as any).component.belongsToCanvas1).toBeTrue();
        expect((service as any).component.previousForegroundStates.length).toEqual(length + 1);
    });

    it('should push to undo stack for canvas 2', () => {
        (service as any).component.currentCanvas = (service as any).component.canvas2.nativeElement;
        (service as any).component.belongsToCanvas1 = true;
        const spy = spyOn((service as any).component.previousForegroundStates, 'push').and.callThrough();
        const length = (service as any).component.previousForegroundStates.length;
        service.pushToUndoStack();
        expect(spy).toHaveBeenCalled();
        expect((service as any).component.belongsToCanvas1).toBeFalse();
        expect((service as any).component.previousForegroundStates.length).toEqual(length + 1);
    });

    it('should empty the redo stack', () => {
        const canvas = document.createElement('canvas');
        (service as any).component.nextForegroundStates = [
            { layer: canvas, belonging: true, swap: false },
            { layer: canvas, belonging: false, swap: true },
        ];
        expect((service as any).component.nextForegroundStates.length).toEqual(2);
        service.emptyRedoStack();
        expect((service as any).component.nextForegroundStates.length).toEqual(0);
    });

    it('should cancel an event when foregrounds are swapped', () => {
        const canvas = document.createElement('canvas');
        (service as any).component.previousForegroundStates = [{ layer: canvas, belonging: true, swap: true }];
        (service as any).component.nextForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = (service as any).component.nextForegroundStates.length;
        const lengthUndo = (service as any).component.previousForegroundStates.length;
        const spyPush = spyOn((service as any).component.nextForegroundStates, 'push').and.callThrough();
        const spySwap = spyOn((service as any).component, 'swapForegrounds').and.stub();
        service.undo();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: true, swap: true });
        expect(spySwap).toHaveBeenCalled();
        expect((service as any).component.nextForegroundStates.length).toEqual(lengthRedo + 1);
        expect((service as any).component.previousForegroundStates.length).toEqual(lengthUndo - 1);
    });

    it('should cancel an event when foregrounds are not swapped', () => {
        const canvas = document.createElement('canvas');
        (service as any).component.previousForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        (service as any).component.nextForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = (service as any).component.nextForegroundStates.length;
        const lengthUndo = (service as any).component.previousForegroundStates.length;
        const spyPush = spyOn((service as any).component.nextForegroundStates, 'push').and.callThrough();
        const spyCanvasAndUpdate = spyOn(service as any, 'getCanvasAndUpdate').and.returnValue(canvas);
        service.undo();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: (service as any).component.belongsToCanvas1, swap: false });
        expect(spyCanvasAndUpdate).toHaveBeenCalledWith({ layer: canvas, belonging: true, swap: false });
        expect((service as any).component.nextForegroundStates.length).toEqual(lengthRedo + 1);
        expect((service as any).component.previousForegroundStates.length).toEqual(lengthUndo - 1);
    });

    it('should not cancel an event if undo stack is empty', () => {
        (service as any).component.previousForegroundStates = [];
        expect((service as any).component.previousForegroundStates.length).toEqual(0);
        service.undo();
        expect((service as any).component.previousForegroundStates.length).toEqual(0);
    });

    it('should redo an event when foregrounds are swapped ', () => {
        const canvas = document.createElement('canvas');
        (service as any).component.nextForegroundStates = [{ layer: canvas, belonging: true, swap: true }];
        (service as any).component.previousForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = (service as any).component.nextForegroundStates.length;
        const lengthUndo = (service as any).component.previousForegroundStates.length;
        const spyPush = spyOn((service as any).component.previousForegroundStates, 'push').and.callThrough();
        const spySwap = spyOn((service as any).component, 'swapForegrounds').and.stub();
        service.redo();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: true, swap: true });
        expect(spySwap).toHaveBeenCalled();
        expect((service as any).component.nextForegroundStates.length).toEqual(lengthRedo - 1);
        expect((service as any).component.previousForegroundStates.length).toEqual(lengthUndo + 1);
    });

    it('should redo an event when foregrounds are not swapped ', () => {
        const canvas = document.createElement('canvas');
        (service as any).component.nextForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        (service as any).component.previousForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        const lengthRedo = (service as any).component.nextForegroundStates.length;
        const lengthUndo = (service as any).component.previousForegroundStates.length;
        const spyPush = spyOn((service as any).component.previousForegroundStates, 'push').and.callThrough();
        const spyCanvasAndUpdate = spyOn(service as any, 'getCanvasAndUpdate').and.returnValue(canvas);
        service.redo();
        expect(spyPush).toHaveBeenCalledWith({ layer: canvas, belonging: (service as any).component.belongsToCanvas1, swap: false });
        expect(spyCanvasAndUpdate).toHaveBeenCalled();
        expect((service as any).component.nextForegroundStates.length).toEqual(lengthRedo - 1);
        expect((service as any).component.previousForegroundStates.length).toEqual(lengthUndo + 1);
    });

    it('should not redo an event if redo stack is empty', () => {
        (service as any).component.nextForegroundStates = [];
        expect((service as any).component.nextForegroundStates.length).toEqual(0);
        service.redo();
        expect((service as any).component.nextForegroundStates.length).toEqual(0);
    });

    it('should handle mouseup event', () => {
        (service as any).component.mousePressed = true;
        service.handleMouseUp();
        expect((service as any).component.mousePressed).toBeFalse();
    });

    it('should handle mouseenter event', () => {
        const event = new MouseEvent('mouseenter');
        (service as any).component.drawMode = DrawModes.PENCIL;
        (service as any).component.mouseInCanvas = false;
        (service as any).handleMouseEnter(event);
        expect((service as any).component.mouseInCanvas).toBeTrue();
    });

    it('should handle mouseleave event', () => {
        const event = new MouseEvent('mouseleave');
        (service as any).component.mouseInCanvas = true;
        (service as any).component.mousePressed = true;
        (service as any).component.drawMode = DrawModes.PENCIL;
        const spyTraceShape = spyOn(service as any, 'traceShape').and.stub();
        const spyDrawImage = spyOn(service as any, 'drawRectangle').and.stub();
        (service as any).handleMouseLeave(event, (service as any).component.context1);
        (service as any).component.drawMode = DrawModes.RECTANGLE;
        (service as any).handleMouseLeave(event, (service as any).component.context1);
        (service as any).component.mousePressed = false;
        (service as any).handleMouseLeave(event, (service as any).component.context1);
        expect(spyDrawImage).toHaveBeenCalledTimes(1);
        expect(spyTraceShape).toHaveBeenCalledTimes(1);
        expect((service as any).component.mouseInCanvas).toBeFalse();
    });

    it('should handle mousemove event', () => {
        const event = new MouseEvent('click');
        (service as any).component.canvas1.nativeElement.dispatchEvent(event);
        (service as any).component.mousePressed = true;
        (service as any).component.mouseInCanvas = true;
        const spyTraceShape = spyOn(service as any, 'traceShape').and.stub();
        const spyDrawRectangle = spyOn(service as any, 'drawRectangle').and.stub();
        (service as any).component.drawMode = DrawModes.PENCIL;
        (service as any).handleMouseMove(event, (service as any).component.context1);
        (service as any).component.drawMode = DrawModes.RECTANGLE;
        (service as any).handleMouseMove(event, (service as any).component.context1);
        (service as any).component.drawMode = DrawModes.ERASER;
        (service as any).handleMouseMove(event, (service as any).component.context1);
        expect(spyTraceShape).toHaveBeenCalledTimes(2);
        expect(spyDrawRectangle).toHaveBeenCalledTimes(1);
    });

    it('should handle mousedown event', () => {
        const event = new MouseEvent('click');
        (service as any).component.canvas1.nativeElement.dispatchEvent(event);
        (service as any).component.mousePressed = true;
        (service as any).component.mouseInCanvas = true;
        const spyDrawCircle = spyOn(service as any, 'drawCircle').and.stub();
        const spyEraseSquare = spyOn(service as any, 'eraseSquare').and.stub();
        const spyDrawImage = spyOn((service as any).component.canvasTemp.context, 'drawImage').and.stub();
        (service as any).component.drawMode = DrawModes.PENCIL;
        (service as any).handleMouseDown(event, (service as any).component.contextForeground1);
        (service as any).component.drawMode = DrawModes.RECTANGLE;
        (service as any).handleMouseDown(event, (service as any).component.contextForeground1);
        (service as any).handleMouseDown(event, (service as any).component.contextForeground2);
        (service as any).component.drawMode = DrawModes.ERASER;
        (service as any).handleMouseDown(event, (service as any).component.contextForeground1);
        expect(spyDrawCircle).toHaveBeenCalledTimes(1);
        expect(spyEraseSquare).toHaveBeenCalledTimes(1);
        expect(spyDrawImage).toHaveBeenCalledTimes(2);
    });

    it("undo shouldn't call swapForegrounds if pop return undefined", () => {
        const spySwap = spyOn((service as any).component, 'swapForegrounds').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(window.Array.prototype, 'pop').and.callFake(function (this: any[]) {
            // eslint-disable-next-line no-invalid-this
            if (!this) return undefined;
            // eslint-disable-next-line no-invalid-this
            if (this.length > 0) {
                // eslint-disable-next-line no-invalid-this
                this.splice(0, 1);
            }
            return undefined;
        });
        // esl
        const canvas = document.createElement('canvas');
        (service as any).component.previousForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        service.undo();
        expect(spySwap).not.toHaveBeenCalled();
    });

    it("redo shouldn't call swapForegrounds if pop return undefined", () => {
        const spySwap = spyOn((service as any).component, 'swapForegrounds').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(window.Array.prototype, 'pop').and.callFake(function (this: any[]) {
            // eslint-disable-next-line no-invalid-this
            if (!this) return undefined;
            // eslint-disable-next-line no-invalid-this
            if (this.length > 0) {
                // eslint-disable-next-line no-invalid-this
                this.splice(0, 1);
            }
            return undefined;
        });
        // esl
        const canvas = document.createElement('canvas');
        (service as any).component.nextForegroundStates = [{ layer: canvas, belonging: true, swap: false }];
        service.redo();
        expect(spySwap).not.toHaveBeenCalled();
    });

    it("shouldn't call drawImage if context is undefined and belonging is true", () => {
        const state = { layer: (service as any).component.canvas2.nativeElement, belonging: true, swap: true };
        const spyDrawImage = spyOn((service as any).component.canvasTemp.context, 'drawImage').and.stub();
        spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(undefined as unknown as CanvasRenderingContext2D);
        (service as any).getCanvasAndUpdate(state);
        expect(spyDrawImage).not.toHaveBeenCalled();
    });

    it("shouldn't call drawImage if context is undefined and belonging is false", () => {
        const state = { layer: (service as any).component.canvas2.nativeElement, belonging: false, swap: true };
        const spyDrawImage = spyOn((service as any).component.canvasTemp.context, 'drawImage').and.stub();
        spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(undefined as unknown as CanvasRenderingContext2D);
        (service as any).getCanvasAndUpdate(state);
        expect(spyDrawImage).not.toHaveBeenCalled();
    });

    it("shouldn't call drawImage if context is undefined for canvas1", () => {
        const spyDrawImage = spyOn((service as any).component.canvasTemp.context, 'drawImage').and.stub();
        (service as any).component.currentCanvas = (service as any).component.canvas1.nativeElement;
        spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(undefined as unknown as CanvasRenderingContext2D);
        service.pushToUndoStack();
        expect(spyDrawImage).not.toHaveBeenCalled();
    });

    it("shouldn't call drawImage if context is undefined for canvas2", () => {
        const spyDrawImage = spyOn((service as any).component.canvasTemp.context, 'drawImage').and.stub();
        (service as any).component.currentCanvas = (service as any).component.canvas2.nativeElement;
        spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(undefined as unknown as CanvasRenderingContext2D);
        service.pushToUndoStack();
        expect(spyDrawImage).not.toHaveBeenCalled();
    });

    it('handleMouseLeave should set mouseInCanvas to false and call traceShape if DrawMode is pencil ', () => {
        const event = new MouseEvent('mouseleave');
        (service as any).component.mousePressed = true;
        const spyTraceShape = spyOn(service as any, 'traceShape').and.stub();
        (service as any).component.drawMode = DrawModes.PENCIL;
        (service as any).handleMouseLeave(event, (service as any).component.context1);
        expect(spyTraceShape).toHaveBeenCalled();
        expect((service as any).component.mouseInCanvas).toBeFalsy();
    });

    it('handleMouseLeave should set mouseInCanvas to false and call traceShape if DrawMode is eraser', () => {
        const event = new MouseEvent('mouseleave');
        (service as any).component.mousePressed = true;
        const spyTraceShape = spyOn(service as any, 'traceShape').and.stub();
        (service as any).component.drawMode = DrawModes.ERASER;
        (service as any).handleMouseLeave(event, (service as any).component.context1);
        expect(spyTraceShape).toHaveBeenCalled();
        expect((service as any).component.mouseInCanvas).toBeFalsy();
    });

    it('handleMouseLeave should set mouseInCanvas to false and call drawRectangle if DrawMode is rectangle', () => {
        const event = new MouseEvent('mouseleave');
        (service as any).component.mousePressed = true;
        const spyTraceShape = spyOn(service as any, 'drawRectangle').and.stub();
        (service as any).component.drawMode = DrawModes.RECTANGLE;
        (service as any).handleMouseLeave(event, (service as any).component.context1);
        expect(spyTraceShape).toHaveBeenCalled();
        expect((service as any).component.mouseInCanvas).toBeFalsy();
    });

    it("handleMouseLeave should set mouseInCanvas to false but shouldn't call drawRectangle or traceShape if mousePressed is false ", () => {
        const event = new MouseEvent('mouseleave');
        (service as any).component.mousePressed = false;
        const spyTraceShape = spyOn(service as any, 'drawRectangle').and.stub();
        const spyDrawRectangle = spyOn(service as any, 'traceShape').and.stub();
        (service as any).component.drawMode = DrawModes.RECTANGLE;
        (service as any).handleMouseLeave(event, (service as any).component.context1);
        expect(spyTraceShape).not.toHaveBeenCalled();
        expect(spyDrawRectangle).not.toHaveBeenCalled();
        expect((service as any).component.mouseInCanvas).toBeFalsy();
    });
});
