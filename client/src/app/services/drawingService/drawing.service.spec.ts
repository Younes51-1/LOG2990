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
        const canvas1 = document.createElement('canvas');
        const context1 = canvas1.getContext('2d');
        const pos = { x: 13, y: 12 };
        service.component.shiftPressed = false;
        const spy = spyOn(service, 'drawRectangle').and.callThrough();
        if (context1) {
            service.component.rectangleState = { canvas: canvas1, context: context1, startPos: { x: 0, y: 0 } };
            const spy2 = spyOn(service.component.rectangleState.context, 'fillRect');
            service.drawRectangle(context1, pos);
            expect(spy).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(0, 0, pos.x, pos.y);
        }
    });

    it('drawRectangle should draw a square if shift is pressed', () => {
        const canvas = service.createNewCanvas();
        const context = canvas.getContext('2d');
        const pos = { x: 13, y: 12 };
        service.component.shiftPressed = true;
        const spy = spyOn(service, 'drawRectangle').and.callThrough();
        if (context) {
            service.component.rectangleState = { canvas, context, startPos: { x: 0, y: 0 } };
            const spy2 = spyOn(service.component.rectangleState.context, 'fillRect');
            service.drawRectangle(context, pos);
            expect(spy).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(0, 0, pos.y, pos.y);
        }
    });

    it('should handle mousedown event', () => {
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
        service.component.handleCanvasEvent('mousedown', event, canvas);
        expect(spy).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
    });

    it('should handle mousemove event', () => {
        const event = new MouseEvent('mousemove');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseMove').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.component.handleCanvasEvent('mousemove', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle mouseup event', () => {
        const event = new MouseEvent('mouseup');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseUp').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.component.handleCanvasEvent('mouseup', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle mouseleave event', () => {
        const event = new MouseEvent('mouseleave');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseLeave').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.component.handleCanvasEvent('mouseleave', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle mouseenter event', () => {
        const event = new MouseEvent('mouseenter');
        const canvas = document.createElement('canvas');
        const spy = spyOn(service, 'handleMouseEnter').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = canvas;
        service.component.handleCanvasEvent('mouseenter', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('handleCanvasEvent should change context depending on the canvas', () => {
        const event = new MouseEvent('mouseup');
        const spy = spyOn(service, 'handleMouseUp').and.callFake(() => {
            return;
        });
        service.component.currentCanvas = service.component.canvas2.nativeElement;
        service.component.handleCanvasEvent('mouseup', event, service.component.canvas2.nativeElement);
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
});
