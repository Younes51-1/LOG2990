/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { DrawModes } from '@app/interfaces/creation-game';
import { GameData } from '@app/interfaces/game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { DrawingService } from '@app/services/drawingService/drawing.service';
import { ForegroundService } from '@app/services/foregroundService/foreground.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('CreationGamePageComponent', () => {
    let component: CreationGamePageComponent;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let foregroundService: ForegroundService;
    let drawingService: DrawingService;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    const differenceMatrix: number[][] = [[]];
    const gameForm = {
        name: 'Find the Differences 1',
        nbDifference: 10,
        image1url: 'https://example.com/image1.jpg',
        image2url: 'https://example.com/image2.jpg',
        difficulte: 'easy',
        soloBestTimes: [
            { name: 'player1', time: 200 },
            { name: 'player2', time: 150 },
        ],
        vsBestTimes: [{ name: 'player1', time: 200 }],
    };
    const gameData: GameData = { gameForm, differenceMatrix };

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getAllGames', 'getGame']);
        communicationServiceSpy.getAllGames.and.returnValue(
            of([
                {
                    name: 'Find the Differences 1',
                    nbDifference: 10,
                    image1url: 'https://example.com/image1.jpg',
                    image2url: 'https://example.com/image2.jpg',
                    difficulte: 'easy',
                    soloBestTimes: [
                        { name: 'player1', time: 200 },
                        { name: 'player2', time: 150 },
                    ],
                    vsBestTimes: [{ name: 'player1', time: 200 }],
                },
                {
                    name: 'Find the Differences 2',
                    nbDifference: 15,
                    image1url: 'https://example.com/image3.jpg',
                    image2url: 'https://example.com/image4.jpg',
                    difficulte: 'medium',
                    soloBestTimes: [
                        { name: 'player3', time: 300 },
                        { name: 'player4', time: 250 },
                    ],
                    vsBestTimes: [{ name: 'player3', time: 200 }],
                },
            ]),
        );
        communicationServiceSpy.getGame.and.returnValue(of(gameData));
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
                {
                    provide: CommunicationService,
                    useValue: communicationServiceSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        foregroundService = TestBed.inject(ForegroundService);
        drawingService = TestBed.inject(DrawingService);
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
            },
        });
    });

    it('should open Differences Dialog when image 1 and 2 has content', fakeAsync(() => {
        const spy = spyOn(component, 'openDifferencesDialog');
        component.image1 = { value: 'image_2_diff.bmp' } as HTMLInputElement;
        component.image2 = { value: 'image_2_diff.bmp' } as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).toHaveBeenCalled();
    }));

    it('should not open Differences Dialog if image2 has no content', fakeAsync(() => {
        const spy = spyOn(component, 'openDifferencesDialog');
        component.image1 = { value: 'image_2_diff.bmp' } as HTMLInputElement;
        component.image2 = { value: undefined } as unknown as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should not open Differences Dialog if image1 has no content', fakeAsync(() => {
        const spy = spyOn(component, 'openDifferencesDialog');
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

    it('handleReaderOnload should call updateImageDisplay for valid image', () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(component, 'getImageData').and.returnValue({ hasCorrectDimensions: true, isBmp: true, is24BitPerPixel: true });
        const spy = spyOn(foregroundService, 'updateImageDisplay');

        component.handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(spy).toHaveBeenCalledWith(mockEvent, mockImageElement);
    });

    it("handleReaderOnload should alert if image doesn't have correct dimmensions", () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(component, 'getImageData').and.returnValue({ hasCorrectDimensions: false, isBmp: true, is24BitPerPixel: true });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        component.handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(window.alert).toHaveBeenCalledWith("Image refusée: elle n'est pas de taille 640x480");
    });

    it("handleReaderOnload should alert if image isn't a 24 bmp image", () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(component, 'getImageData').and.returnValue({ hasCorrectDimensions: true, isBmp: false, is24BitPerPixel: false });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        component.handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(window.alert).toHaveBeenCalledWith('Image refusée: elle ne respecte pas le format BMP-24 bit');
    });

    it("handleReaderOnload should alert if image doesn't have correct dimmensions and isn't 24 bits bmp image", () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(component, 'getImageData').and.returnValue({ hasCorrectDimensions: false, isBmp: false, is24BitPerPixel: false });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        component.handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(window.alert).toHaveBeenCalledWith('Image refusée: elle ne respecte pas le format BMP-24 bit de taille 640x480');
    });

    it('handleReaderOnload should call getImageData', () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(component, 'getImageData').and.returnValue({ hasCorrectDimensions: false, isBmp: false, is24BitPerPixel: false });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        component.handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(component.getImageData).toHaveBeenCalledWith(mockFileReader);
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    it('getImageData should return bool after being called', fakeAsync(() => {
        const mockArrayBuffer = new ArrayBuffer(32);
        const dataView = new DataView(mockArrayBuffer);
        dataView.setInt32(18, 640, true);
        dataView.setInt32(22, -480, true);
        dataView.setUint8(0, 66);
        dataView.setUint8(1, 77);
        dataView.setUint8(28, 24);
        const mockReader = {
            result: mockArrayBuffer,
        } as unknown as FileReader;
        const res = component.getImageData(mockReader);
        expect(res).toEqual({ hasCorrectDimensions: true, isBmp: true, is24BitPerPixel: true });
    }));
    /* eslint-enable @typescript-eslint/no-magic-numbers */

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
        component.image2 = { value: 'image_empty.bmp' } as HTMLInputElement;
        const file = new File(['image_empty.bmp'], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.verifyImageFormat(event, component.image2);
        tick();
        expect(readerAsArrayBufferSpy).toHaveBeenCalled();
    }));

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
});
