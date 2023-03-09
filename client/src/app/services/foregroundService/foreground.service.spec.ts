import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ChildrenOutletContexts, DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { ForegroundService } from '@app/services/foregroundService/foreground.service';

describe('ForegroundService', () => {
    let service: ForegroundService;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let component: CreationGamePageComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule, RouterModule, RouterTestingModule],
            providers: [CommunicationService, { provide: UrlSerializer, useClass: DefaultUrlSerializer }, ChildrenOutletContexts],
        });
        service = TestBed.inject(ForegroundService);
        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        service.component = component;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset foreground 1', () => {
        service.component.context1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const spyClearRect = spyOn(service.component.context1, 'clearRect').and.callThrough();
        const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        service.component.canvas1.nativeElement = document.createElement('canvas');
        service.reset(service.component.canvas1.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should reset foreground 2', () => {
        const spyClearRect = spyOn(service.component.context2, 'clearRect').and.callThrough();
        const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        service.component.canvas2.nativeElement = document.createElement('canvas');
        service.component.reset(service.component.canvas2.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should duplicate foreground 1 to foreground 2', () => {
        const spyUpdateContext = spyOn(service, 'updateContext').and.callThrough();
        const spyDrawImage = spyOn(service.component.context2, 'drawImage').and.callThrough();
        const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        service.component.canvas1.nativeElement = document.createElement('canvas');
        service.component.duplicateForeground(service.component.canvas1.nativeElement);
        expect(spyUpdateContext).toHaveBeenCalledWith(service.component.context2, service.component.canvasForeground2, service.component.urlPath2);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should duplicate foreground 2 to foreground 1', () => {
        const spyUpdateContext = spyOn(service, 'updateContext').and.callThrough();
        const spyDrawImage = spyOn(service.component.context1, 'drawImage').and.callThrough();
        const spyPushToUndoStack = spyOn(service.component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        service.component.canvas2.nativeElement = document.createElement('canvas');
        service.component.duplicateForeground(service.component.canvas2.nativeElement);
        expect(spyUpdateContext).toHaveBeenCalledWith(service.component.context1, service.component.canvasForeground1, service.component.urlPath1);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should swap foregrounds', () => {
        const spyUpdateContext = spyOn(service, 'updateContext').and.callThrough();
        const spyDrawImage1 = spyOn(service.component.context1, 'drawImage').and.callThrough();
        const spyDrawImage2 = spyOn(service.component.context2, 'drawImage').and.callThrough();
        service.component.swapForegrounds();
        expect(spyUpdateContext).toHaveBeenCalledTimes(2);
        expect(spyDrawImage1).toHaveBeenCalled();
        expect(spyDrawImage2).toHaveBeenCalled();
    });

    it('should push and swap foregrounds', () => {
        const spyEmptyRedoStack = spyOn(service.component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        const spySwapForeground = spyOn(service, 'swapForegrounds').and.callFake(() => {
            return;
        });
        service.component.pushAndSwapForegrounds();
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
        expect(updateContextSpy).toHaveBeenCalledTimes(2);
    });
});