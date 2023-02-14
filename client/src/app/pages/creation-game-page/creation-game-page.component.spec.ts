import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { CreationGamePageComponent } from './creation-game-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('CreationGamePageComponent', () => {
    let component: CreationGamePageComponent;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let detectionDifferenceService: DetectionDifferenceService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, HttpClientModule, BrowserAnimationsModule],
            declarations: [CreationGamePageComponent],
            providers: [
                { provide: MatDialog },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        image: null,
                        nbDifferences: 5,
                    },
                },
                DetectionDifferenceService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
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

    it('should reset image 1', () => {
        const spyClearRect = spyOn(component.context1, 'clearRect').and.callThrough();
        component.inputImage1.nativeElement = document.createElement('input');
        component.reset(component.inputImage1.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
    });

    it('should reset image 2', () => {
        const spyClearRect = spyOn(component.context2, 'clearRect').and.callThrough();
        component.inputImage2.nativeElement = document.createElement('input');
        component.reset(component.inputImage2.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
    });

    it('should reset image 1 and 2', () => {
        const spyClearRect = spyOn(component.context1, 'clearRect').and.callThrough();
        const spyClearRect2 = spyOn(component.context2, 'clearRect').and.callThrough();
        component.inputImage2.nativeElement = document.createElement('input');
        component.reset(component.inputImages1et2.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyClearRect2).toHaveBeenCalled();
    });

    it('changing image should call verifyImageFormat', () => {
        const spy = spyOn(component, 'verifyImageFormat');
        expect(spy).not.toHaveBeenCalled();
        const image = fixture.debugElement.nativeElement.querySelector('div > p > input');
        image.dispatchEvent(new Event('change'));
        expect(spy).toHaveBeenCalled();
    });

    it('openDifferencesDialog should open dialog', async () => {
        const spy = spyOn(component.dialog, 'open');
        await component.openDifferencesDialog();
        expect(spy).toHaveBeenCalledOnceWith(ModalDialogComponent, {
            data: {
                imageUrl: component.imageDifferencesUrl,
                nbDifferences: component.differenceCount,
                flipped: component.flipImage,
            },
        });
    });

    it('updateImageDisplay should update image1 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const image1 = component.inputImage1.nativeElement;
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.updateImageDisplay(event, image1);
        expect(component.image1).toEqual(image1);
        expect(spy).toHaveBeenCalled();
    });

    it('updateImageDisplay should update image2 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const updateContextSpy = spyOn(component, 'updateContext');
        const image2 = component.inputImage2.nativeElement;
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.updateImageDisplay(event, image2);
        expect(component.image2).toEqual(image2);
        expect(spy).toHaveBeenCalled();
        expect(updateContextSpy).toHaveBeenCalled();
    });

    it('updateImageDisplay should update image1et2 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const image1et2 = component.inputImages1et2.nativeElement;
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.updateImageDisplay(event, image1et2);
        expect(component.image1).toEqual(image1et2);
        expect(component.image2).toEqual(image1et2);
        expect(spy).toHaveBeenCalled();
    });

    it('should open Differences Dialog when image 1 and 2 has content', fakeAsync(() => {
        const spy = spyOn(component, 'openDifferencesDialog');
        detectionDifferenceService = TestBed.inject(DetectionDifferenceService);
        spyOn(detectionDifferenceService, 'readThenConvertImage').and.returnValue(
            Promise.resolve([
                [0, 0],
                [0, 0],
            ]),
        );
        component.image1 = { value: 'image_2_diff.bmp' } as HTMLInputElement;
        component.image2 = { value: 'image_2_diff.bmp' } as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).toHaveBeenCalled();
    }));

    it('should not open Differences Dialog if image2 has no content', fakeAsync(() => {
        const spy = spyOn(component, 'openDifferencesDialog');
        detectionDifferenceService = TestBed.inject(DetectionDifferenceService);
        spyOn(detectionDifferenceService, 'readThenConvertImage').and.returnValue(
            Promise.resolve([
                [0, 0],
                [0, 0],
            ]),
        );
        component.image1 = { value: 'image_2_diff.bmp' } as HTMLInputElement;
        component.image2 = { value: undefined } as unknown as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should not open Differences Dialog if image1 has no content', fakeAsync(() => {
        const spy = spyOn(component, 'openDifferencesDialog');
        detectionDifferenceService = TestBed.inject(DetectionDifferenceService);
        spyOn(detectionDifferenceService, 'readThenConvertImage').and.returnValue(
            Promise.resolve([
                [0, 0],
                [0, 0],
            ]),
        );
        component.image2 = { value: 'image_2_diff.bmp' } as HTMLInputElement;
        component.image1 = { value: undefined } as unknown as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('save name game should set nameGame', () => {
        const newGameName = 'newGameName';
        component.saveNameGame(newGameName);
        expect(component.nameGame).toEqual(newGameName);
    });

    it('should call convert image to data url', () => {
        const canvas = document.createElement('canvas');
        const spy = spyOn(canvas, 'toDataURL').and.returnValue('fake,value');
        const res = component.convertImageToB64Url(canvas);
        expect(spy).toHaveBeenCalled();
        expect(res).toEqual('value');
    });

    it('should close dialogRef', () => {
        const mock = jasmine.createSpyObj('dialogRef', ['close']);
        component.dialogRef = mock;
        component.ngOnDestroy();
        expect(mock.close).toHaveBeenCalled();
    });

    it("shouldn't call saveNameGame after closing Matdialog if result is undefined", () => {
        const saveNameGameSpy = spyOn(component, 'saveNameGame');
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        component.openDifferencesDialog();
        const dialogRefSpy = spyOn(component.dialogRef, 'afterClosed').and.callThrough();
        dialogRefSpy.and.returnValue(of(undefined));
        dialogSpy.open.and.returnValue(dialogRefSpy);
        component.dialogRef.close();
        expect(component.dialogRef).toBeDefined();
        expect(saveNameGameSpy).not.toHaveBeenCalled();
    });

    it('should reset input value if file format is invalid', fakeAsync(() => {
        const readerAsArrayBufferSpy = spyOn(FileReader.prototype, 'readAsArrayBuffer');
        detectionDifferenceService = TestBed.inject(DetectionDifferenceService);
        component.image2 = { value: 'image_empty.bmp' } as HTMLInputElement;
        const file = new File(['image_empty.bmp'], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.verifyImageFormat(event, component.image2);
        tick();
        expect(readerAsArrayBufferSpy).toHaveBeenCalled();
    }));
});
