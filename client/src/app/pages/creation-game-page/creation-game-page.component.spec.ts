import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { CreationGamePageComponent } from './creation-game-page.component';

describe('CreationGamePageComponent', () => {
    let component: CreationGamePageComponent;
    let fixture: ComponentFixture<CreationGamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, HttpClientModule],
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

    it('reset should leave the canvas blank', () => {
        const image = new Image();
        image.src = 'image_2_diff.bmp';
        image.onload = () => {
            component.context1.drawImage(image, 0, 0, component.width, component.height);
        };
        const spyReset = spyOn(component, 'reset').and.callThrough();
        const spyClearRect = spyOn(component.context1, 'clearRect').and.callThrough();
        component.inputImage1.nativeElement = document.createElement('input');
        component.reset(component.inputImage1.nativeElement);
        expect(spyReset).toHaveBeenCalled();
        expect(spyClearRect).toHaveBeenCalled();
    });

    it('changing image should call verifyImageFormat', () => {
        const spy = spyOn(component, 'verifyImageFormat');
        expect(spy).not.toHaveBeenCalled();
        const image = fixture.debugElement.nativeElement.querySelector('div > p > input');
        image.dispatchEvent(new Event('change'));
        expect(spy).toHaveBeenCalled();
    });

    // TODO: fix this test
    // it('verifyImageFormat should call updateDisplayDiffButton and execute the load Event', () => {
    //     const spy1 = spyOn(component, 'updateImageDisplay');
    //     const spy2 = spyOn(window, 'FileReader');
    //     const image = fixture.debugElement.nativeElement.querySelector('div > p > input');
    //     const dataTransfer = new DataTransfer();
    //     const file = new File([''], 'image_wrong_bit_depth.bmp');
    //     dataTransfer.items.add(file);
    //     image.files = dataTransfer.files;

    //     image.dispatchEvent(new InputEvent('change'));
    //     expect(spy1).toHaveBeenCalled();
    //     expect(spy2).toHaveBeenCalled();
    // });

    it('openDifferencesDialog should call runDetectionSystem and dialog.open', async () => {
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
        const image1 = fixture.debugElement.nativeElement.querySelector('div p:nth-child(1) input');
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.updateImageDisplay(event, image1);
        expect(component.image1).toEqual(image1);
        expect(spy).toHaveBeenCalled();
    });

    it('updateImageDisplay should update image2 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const image2 = fixture.debugElement.nativeElement.querySelector('div p:nth-child(3) input');
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.updateImageDisplay(event, image2);
        expect(component.image2).toEqual(image2);
        expect(spy).toHaveBeenCalled();
    });

    it('updateImageDisplay should update image1et2 display', () => {
        const spy = spyOn(URL, 'createObjectURL');
        const image1et2 = fixture.debugElement.nativeElement.querySelector('div > p > input');
        const file = new File([''], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.updateImageDisplay(event, image1et2);
        expect(component.image1).toEqual(image1et2);
        expect(component.image2).toEqual(image1et2);
        expect(spy).toHaveBeenCalled();
    });
});
