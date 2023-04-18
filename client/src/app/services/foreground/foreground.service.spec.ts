/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { ChildrenOutletContexts, DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { ForegroundService } from '@app/services/foreground/foreground.service';

describe('ForegroundService', () => {
    let service: ForegroundService;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let component: CreationGamePageComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CreationGamePageComponent],
            imports: [HttpClientTestingModule, MatDialogModule, RouterModule, RouterTestingModule, CommonModule, BrowserModule],
            providers: [CommunicationHttpService, { provide: UrlSerializer, useClass: DefaultUrlSerializer }, ChildrenOutletContexts],
        });
        service = TestBed.inject(ForegroundService);
        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        (service as any).component = component;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset image 1', () => {
        const spyClearRect = spyOn(service, 'clearRectWithWhite').and.callThrough();
        component.inputImage1.nativeElement = document.createElement('input');
        component.reset(component.inputImage1.nativeElement);
        expect(spyClearRect).toHaveBeenCalledOnceWith(component.context1);
    });

    it('should reset image 2', () => {
        const spyClearRect = spyOn(service, 'clearRectWithWhite').and.callThrough();
        component.inputImage2.nativeElement = document.createElement('input');
        component.reset(component.inputImage2.nativeElement);
        expect(spyClearRect).toHaveBeenCalledOnceWith(component.context2);
    });

    it('should reset image 1 and 2', () => {
        const spyClearRect = spyOn(service, 'clearRectWithWhite').and.callThrough();
        component.inputImage2.nativeElement = document.createElement('input');
        component.reset(component.inputImages1et2.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyClearRect).toHaveBeenCalledWith(component.context1);
        expect(spyClearRect).toHaveBeenCalledWith(component.context2);
    });

    it('should reset foreground 1', () => {
        (service as any).component.context1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const spyClearRect = spyOn(service, 'clearRectWithWhite').and.callThrough();
        const spyPushToUndoStack = spyOn((service as any).component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn((service as any).component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        (service as any).component.canvas1.nativeElement = document.createElement('canvas');
        service.reset((service as any).component.canvas1.nativeElement);
        expect(spyClearRect).toHaveBeenCalledWith(component.context1);
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should reset foreground 2', () => {
        const spyClearRect = spyOn(service, 'clearRectWithWhite').and.callThrough();
        const spyPushToUndoStack = spyOn((service as any).component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn((service as any).component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        (service as any).component.canvas2.nativeElement = document.createElement('canvas');
        (service as any).component.reset((service as any).component.canvas2.nativeElement);
        expect(spyClearRect).toHaveBeenCalledWith(component.context2);
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should duplicate foreground 1 to foreground 2', () => {
        const spyUpdateContext = spyOn(service, 'updateContext').and.callThrough();
        const spyDrawImage = spyOn((service as any).component.context2, 'drawImage').and.callThrough();
        const spyPushToUndoStack = spyOn((service as any).component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn((service as any).component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        (service as any).component.canvas1.nativeElement = document.createElement('canvas');
        (service as any).component.duplicateForeground((service as any).component.canvas1.nativeElement);
        expect(spyUpdateContext).toHaveBeenCalledWith(
            (service as any).component.context2,
            (service as any).component.canvasForeground2,
            (service as any).component.urlPath2,
        );
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should duplicate foreground 2 to foreground 1', () => {
        const spyUpdateContext = spyOn(service, 'updateContext').and.callThrough();
        const spyDrawImage = spyOn((service as any).component.context1, 'drawImage').and.callThrough();
        const spyPushToUndoStack = spyOn((service as any).component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn((service as any).component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        (service as any).component.canvas2.nativeElement = document.createElement('canvas');
        (service as any).component.duplicateForeground((service as any).component.canvas2.nativeElement);
        expect(spyUpdateContext).toHaveBeenCalledWith(
            (service as any).component.context1,
            (service as any).component.canvasForeground1,
            (service as any).component.urlPath1,
        );
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should swap foregrounds', () => {
        const spyUpdateContext = spyOn(service, 'updateContext').and.callThrough();
        const spyDrawImage1 = spyOn((service as any).component.context1, 'drawImage').and.callThrough();
        const spyDrawImage2 = spyOn((service as any).component.context2, 'drawImage').and.callThrough();
        (service as any).component.swapForegrounds();
        expect(spyUpdateContext).toHaveBeenCalled();
        expect(spyDrawImage1).toHaveBeenCalled();
        expect(spyDrawImage2).toHaveBeenCalled();
    });

    it('should return without swapping if contextTemp is null', () => {
        spyOn(window.HTMLCanvasElement.prototype, 'getContext').and.callFake(() => {
            return null;
        });
        const spyUpdateContext = spyOn(service, 'updateContext').and.callThrough();
        (service as any).component.swapForegrounds();
        expect(spyUpdateContext).not.toHaveBeenCalled();
    });

    it('should push and swap foregrounds', () => {
        const spyEmptyRedoStack = spyOn((service as any).component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        const spySwapForeground = spyOn(service, 'swapForegrounds').and.callFake(() => {
            return;
        });
        (service as any).component.pushAndSwapForegrounds();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spySwapForeground).toHaveBeenCalled();
    });

    it('updateImageDisplay should update image1 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const updateContextSpy = spyOn(service, 'updateContext');
        const image1 = component.inputImage1.nativeElement;
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        service.updateImageDisplay(event, image1);
        expect(component.image1).toEqual(image1);
        expect(spy).toHaveBeenCalled();
        expect(updateContextSpy).toHaveBeenCalled();
    });

    it('updateImageDisplay should update image2 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const updateContextSpy = spyOn(service, 'updateContext');
        const image2 = component.inputImage2.nativeElement;
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        service.updateImageDisplay(event, image2);
        expect(component.image2).toEqual(image2);
        expect(spy).toHaveBeenCalled();
        expect(updateContextSpy).toHaveBeenCalled();
    });

    it('updateImageDisplay should update image1et2 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const updateContextSpy = spyOn(service, 'updateContext');
        const image1et2 = component.inputImages1et2.nativeElement;
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        service.updateImageDisplay(event, image1et2);
        expect(component.image1).toEqual(image1et2);
        expect(component.image2).toEqual(image1et2);
        expect(spy).toHaveBeenCalled();
        expect(updateContextSpy).toHaveBeenCalled();
    });

    it('updateContext should load images', (done) => {
        (service as any).component.context1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        (service as any).component.context1.clearRect(0, 0, component.width, component.height);
        const drawImageSpy = spyOn((service as any).component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        service.updateContext(component.context1, component.canvasForeground1, 'https://i.imgur.com/tG1K4kJ.jpeg');
        setTimeout(() => {
            expect(drawImageSpy).toHaveBeenCalled();
            done();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1000);
    });

    it('should fill context in white', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            const spy = spyOn(context, 'fillRect');
            context.fillStyle = '#000000';
            service.clearRectWithWhite(context);
            expect(context.fillStyle).toEqual('#ffffff');
            expect(spy).toHaveBeenCalledWith(0, 0, component.width, component.height);
        }
    });

    it('should set component and width and height when setComponent()', () => {
        service.setComponent(component);
        expect((service as any).component).toEqual(component);
        expect((service as any).width).toEqual(component.width);
        expect((service as any).height).toEqual(component.height);
    });

    it('duplicateForeground should empty redo stack and call all functions', () => {
        const spyEmptyRedoStack = spyOn((service as any).component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        const spyPushToUndoStack = spyOn((service as any).component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyUpdateContext = spyOn(service, 'updateContext').and.callFake(() => {
            return;
        });
        const spyDrawImage = spyOn((service as any).component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        service.duplicateForeground((service as any).component.canvas2.nativeElement);
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyUpdateContext).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    });

    it('invertForegrounds should empty redo stack and call all functions', () => {
        const spyEmptyRedoStack = spyOn((service as any).component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        const spySwapForeground = spyOn(service, 'swapForegrounds').and.callFake(() => {
            return;
        });
        service.invertForegrounds();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spySwapForeground).toHaveBeenCalled();
    });

    it('swapForegrounds should call all functions', () => {
        const spyUpdateContext = spyOn(service, 'updateContext').and.callFake(() => {
            return;
        });
        const spyDrawImage1 = spyOn((service as any).component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        const spyDrawImage2 = spyOn((service as any).component.context2, 'drawImage').and.callFake(() => {
            return;
        });
        service.swapForegrounds();
        expect(spyUpdateContext).toHaveBeenCalled();
        expect(spyDrawImage1).toHaveBeenCalled();
        expect(spyDrawImage2).toHaveBeenCalled();
    });
});
