/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawModes } from '@app/interfaces/creation-game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ForegroundService } from '@app/services/foreground/foreground.service';
import { ImageLoadService } from '@app/services/image-load/image-load.service';

describe('CreationGamePageComponent', () => {
    let component: CreationGamePageComponent;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let foregroundService: ForegroundService;
    let drawingService: DrawingService;
    let communicationService: CommunicationHttpService;
    let imageLoadService: ImageLoadService;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, HttpClientModule, BrowserAnimationsModule],
            declarations: [CreationGamePageComponent],
        });
        foregroundService = TestBed.inject(ForegroundService);
        drawingService = TestBed.inject(DrawingService);
        communicationService = TestBed.inject(CommunicationHttpService);
        imageLoadService = TestBed.inject(ImageLoadService);
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('radius must be updated when a radio button is selected', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const radiuses = [0, 3, 9, 15];
        const spy = spyOn(component, 'updateRadius').and.callThrough();
        for (const radius of radiuses) {
            const inputRayon = fixture.debugElement.nativeElement.querySelector(`input[value=${CSS.escape(radius.toString())}]`);
            inputRayon.click();
            expect(spy).toHaveBeenCalled();
            expect(component.radius).toBe(radius);
        }
    });

    it('by default, radio button 3 must be selected', () => {
        const inputRayon3 = fixture.debugElement.nativeElement.querySelector(`input[value=${CSS.escape('3')}]`);
        expect(inputRayon3.checked).toBeTruthy();
    });

    it('should return the router', () => {
        expect(component.getRouter).toBe(router);
    });

    it('should return the foreground service', () => {
        expect(component.getForegroundService).toBe(foregroundService);
    });

    it('should return the communication service', () => {
        expect(component.getCommunicationService).toBe(communicationService);
    });

    it('ngAfterViewInit should call set components to services', () => {
        const drawingServiceSpy = spyOn(drawingService, 'setComponent').and.stub();
        const foregroundServiceSpy = spyOn(foregroundService, 'setComponent').and.stub();
        const imageLoadServiceSpy = spyOn(imageLoadService, 'setComponent').and.stub();
        component.ngAfterViewInit();
        expect(drawingServiceSpy).toHaveBeenCalled();
        expect(foregroundServiceSpy).toHaveBeenCalled();
        expect(imageLoadServiceSpy).toHaveBeenCalled();
    });

    it('should call verifyImageFormat from imageLoadService', () => {
        const event = new Event('click');
        const img = document.createElement('button') as HTMLInputElement;
        const spy = spyOn(imageLoadService, 'verifyImageFormat');
        component.verifyImageFormat(event, img);
        expect(spy).toHaveBeenCalledWith(event, img);
    });

    it('should call runDetectionSystem from imageLoadService', fakeAsync(() => {
        const spy = spyOn(imageLoadService, 'runDetectionSystem');
        component.runDetectionSystem();
        tick();
        expect(spy).toHaveBeenCalled();
    }));

    it('should close dialogRef', () => {
        const mock = jasmine.createSpyObj('dialogRef', ['close']);
        component.dialogRef = mock;
        component.ngOnDestroy();
        expect(mock.close).toHaveBeenCalled();
    });

    it('should enable the mode', () => {
        component.drawMode = DrawModes.PENCIL;
        component.mousePressed = true;
        component.enableMode(DrawModes.RECTANGLE);
        expect(component.drawMode).toEqual(DrawModes.RECTANGLE);
        expect(component.mousePressed).toBeFalse();
    });

    it('should call updateContext of ForegroundService', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const background = 'background';
        const spy = spyOn(foregroundService, 'updateContext');
        component.updateContext(context as CanvasRenderingContext2D, canvas, background);
        expect(spy).toHaveBeenCalledOnceWith(context as CanvasRenderingContext2D, canvas, background);
    });

    it('should call swapForegrounds of ForegroundService', () => {
        const spy = spyOn(foregroundService, 'swapForegrounds');
        component.swapForegrounds();
        expect(spy).toHaveBeenCalled();
    });

    it('should call reset of ForegroundService', () => {
        const element = document.createElement('canvas');
        const spy = spyOn(foregroundService, 'reset');
        component.reset(element as HTMLElement);
        expect(spy).toHaveBeenCalledOnceWith(element);
    });

    it('should call duplicateForeground of ForegroundService', () => {
        const element = document.createElement('canvas');
        const spy = spyOn(foregroundService, 'duplicateForeground');
        component.duplicateForeground(element);
        expect(spy).toHaveBeenCalledOnceWith(element);
    });

    it('should call pushAndSwapForegrounds of ForegroundService', () => {
        const spy = spyOn(foregroundService, 'pushAndSwapForegrounds');
        component.pushAndSwapForegrounds();
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleCanvasEvent of DrawingService', () => {
        const str = 'event';
        const event = new MouseEvent('mouseup');
        const canvas = document.createElement('canvas');
        const spy = spyOn(drawingService, 'handleCanvasEvent');
        component.handleCanvasEvent(str, event, canvas);
        expect(spy).toHaveBeenCalledOnceWith(str, event, canvas);
    });

    it('should call handleMouseUp of DrawingService', () => {
        const spy = spyOn(drawingService, 'handleMouseUp');
        component.handleMouseUp();
        expect(spy).toHaveBeenCalled();
    });

    it('should call ctrlZ of DrawingService', () => {
        const spy = spyOn(drawingService, 'ctrlZ');
        component.ctrlZ();
        expect(spy).toHaveBeenCalled();
    });

    it('should call ctrlShiftZ of DrawingService', () => {
        const spy = spyOn(drawingService, 'ctrlShiftZ');
        component.ctrlShiftZ();
        expect(spy).toHaveBeenCalled();
    });

    it('should call pushToUndoStack of DrawingService', () => {
        const spy = spyOn(drawingService, 'pushToUndoStack');
        component.pushToUndoStack();
        expect(spy).toHaveBeenCalled();
    });

    it('should call emptyRedoStack of DrawingService', () => {
        const spy = spyOn(drawingService, 'emptyRedoStack');
        component.emptyRedoStack();
        expect(spy).toHaveBeenCalled();
    });

    it('should call ctrlZ() if ctrl + Z is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
        const spy = spyOn(component, 'ctrlZ');
        document.dispatchEvent(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should call ctrlShiftZ() if ctrl + Shift + Z is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: 'Z', ctrlKey: true, shiftKey: true });
        const spy = spyOn(component, 'ctrlShiftZ');
        document.dispatchEvent(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should set shiftPressed to true is Shift is pressed', () => {
        const event = new KeyboardEvent('keydown', { shiftKey: true });
        component.shiftPressed = false;
        document.dispatchEvent(event);
        expect(component.shiftPressed).toBeTruthy();
    });

    it('should set shiftPressed to false is Shift is unpressed', () => {
        const event = new KeyboardEvent('keyup', { key: 'Shift' });
        component.shiftPressed = true;
        document.dispatchEvent(event);
        expect(component.shiftPressed).toBeFalsy();
    });

    it('should update rectangle when shift is pressed and is drawing Rectangle', () => {
        const event = new KeyboardEvent('keydown', { shiftKey: true });
        component.shiftPressed = false;
        component.mousePressed = true;
        component.drawMode = DrawModes.RECTANGLE;
        const spy = spyOn(drawingService, 'updateRectangle');
        document.dispatchEvent(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should update rectangle when shift is unpressed and is drawing Rectangle', () => {
        const event = new KeyboardEvent('keyup', { key: 'Shift' });
        component.mousePressed = true;
        component.drawMode = DrawModes.RECTANGLE;
        const spy = spyOn(drawingService, 'updateRectangle');
        document.dispatchEvent(event);
        expect(spy).toHaveBeenCalled();
    });
});
