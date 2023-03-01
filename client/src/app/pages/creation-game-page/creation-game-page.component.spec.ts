/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { GameData } from '@app/interfaces/game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

enum DrawModes {
    PENCIL = 'pencil',
    RECTANGLE = 'rectangle',
    ERASER = 'eraser',
    NOTHING = '',
}
describe('CreationGamePageComponent', () => {
    let component: CreationGamePageComponent;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let detectionDifferenceService: DetectionDifferenceService;
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

    it('handleReaderOnload should call updateImageDisplay for valid image', () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(component, 'getImageData').and.returnValue({ hasCorrectDimensions: true, isBmp: true, is24BitPerPixel: true });
        spyOn(component, 'updateImageDisplay');

        component.handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(component.updateImageDisplay).toHaveBeenCalledWith(mockEvent, mockImageElement);
    });

    it("handleReaderOnload should alert if image doesn't have correct dimmensions", () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(component, 'getImageData').and.returnValue({ hasCorrectDimensions: false, isBmp: true, is24BitPerPixel: true });
        spyOn(component, 'updateImageDisplay');
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
        spyOn(component, 'updateImageDisplay');
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
        spyOn(component, 'updateImageDisplay');
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
        spyOn(component, 'updateImageDisplay');
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
        detectionDifferenceService = TestBed.inject(DetectionDifferenceService);
        component.image2 = { value: 'image_empty.bmp' } as HTMLInputElement;
        const file = new File(['image_empty.bmp'], 'image_empty.bmp', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.verifyImageFormat(event, component.image2);
        tick();
        expect(readerAsArrayBufferSpy).toHaveBeenCalled();
    }));

    // Tests : Avant-plan
    it('createNewCanvas should create a new canvas', () => {
        const width = 640;
        const height = 480;
        const spy = spyOn(component, 'createNewCanvas').and.callThrough();
        const canvas = component.createNewCanvas();
        expect(spy).toHaveBeenCalled();
        expect(canvas.width).toEqual(width);
        expect(canvas.height).toEqual(height);
    });

    it('drawRectangle should draw a rectangle if shift is not pressed', () => {
        const canvas = component.createNewCanvas();
        const context = canvas.getContext('2d');
        const pos = { x: 13, y: 12 };
        component.shiftPressed = false;
        const spy = spyOn(component, 'drawRectangle').and.callThrough();
        if (context) {
            component.rectangleState = { canvas, context, startPos: { x: 0, y: 0 } };
            const spy2 = spyOn(component.rectangleState.context, 'fillRect');
            component.drawRectangle(context, pos);
            expect(spy).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(0, 0, pos.x, pos.y);
        }
    });

    it('drawRectangle should draw a square if shift is pressed', () => {
        const canvas = component.createNewCanvas();
        const context = canvas.getContext('2d');
        const pos = { x: 13, y: 12 };
        component.shiftPressed = true;
        const spy = spyOn(component, 'drawRectangle').and.callThrough();
        if (context) {
            component.rectangleState = { canvas, context, startPos: { x: 0, y: 0 } };
            const spy2 = spyOn(component.rectangleState.context, 'fillRect');
            component.drawRectangle(context, pos);
            expect(spy).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalledWith(0, 0, pos.y, pos.y);
        }
    });

    it('should reset foreground 1', () => {
        const spyClearRect = spyOn(component.context1, 'clearRect').and.callThrough();
        const spyPushToUndoStack = spyOn(component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        component.canvas1.nativeElement = document.createElement('canvas');
        component.reset(component.canvas1.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should reset foreground 2', () => {
        const spyClearRect = spyOn(component.context2, 'clearRect').and.callThrough();
        const spyPushToUndoStack = spyOn(component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        component.canvas2.nativeElement = document.createElement('canvas');
        component.reset(component.canvas2.nativeElement);
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should duplicate foreground 1 to foreground 2', () => {
        const spyUpdateContext = spyOn(component, 'updateContext').and.callThrough();
        const spyDrawImage = spyOn(component.context2, 'drawImage').and.callThrough();
        const spyPushToUndoStack = spyOn(component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        component.canvas1.nativeElement = document.createElement('canvas');
        component.duplicateForeground(component.canvas1.nativeElement);
        expect(spyUpdateContext).toHaveBeenCalledWith(component.context2, component.canvasForeground2, component.urlPath2);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should duplicate foreground 2 to foreground 1', () => {
        const spyUpdateContext = spyOn(component, 'updateContext').and.callThrough();
        const spyDrawImage = spyOn(component.context1, 'drawImage').and.callThrough();
        const spyPushToUndoStack = spyOn(component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        component.canvas2.nativeElement = document.createElement('canvas');
        component.duplicateForeground(component.canvas2.nativeElement);
        expect(spyUpdateContext).toHaveBeenCalledWith(component.context1, component.canvasForeground1, component.urlPath1);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
    });

    it('should swap foregrounds', () => {
        const spyUpdateContext = spyOn(component, 'updateContext').and.callThrough();
        const spyDrawImage1 = spyOn(component.context1, 'drawImage').and.callThrough();
        const spyDrawImage2 = spyOn(component.context2, 'drawImage').and.callThrough();
        component.swapForegrounds();
        expect(spyUpdateContext).toHaveBeenCalledTimes(2);
        expect(spyDrawImage1).toHaveBeenCalled();
        expect(spyDrawImage2).toHaveBeenCalled();
    });

    it('should push and swap foregrounds', () => {
        const spyEmptyRedoStack = spyOn(component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        const spySwapForeground = spyOn(component, 'swapForegrounds').and.callFake(() => {
            return;
        });
        component.pushAndSwapForegrounds();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spySwapForeground).toHaveBeenCalled();
    });

    it('should handle mousedown event', () => {
        const event = new MouseEvent('mousedown');
        const canvas = document.createElement('canvas');
        const spy = spyOn(component, 'handleMouseDown').and.callFake(() => {
            return;
        });
        const spyEmptyRedoStack = spyOn(component, 'emptyRedoStack').and.callFake(() => {
            return;
        });
        const spyPushToUndoStack = spyOn(component, 'pushToUndoStack').and.callFake(() => {
            return;
        });
        component.currentCanvas = canvas;
        component.handleCanvasEvent('mousedown', event, canvas);
        expect(spy).toHaveBeenCalled();
        expect(spyEmptyRedoStack).toHaveBeenCalled();
        expect(spyPushToUndoStack).toHaveBeenCalled();
    });

    it('should handle mousemove event', () => {
        const event = new MouseEvent('mousemove');
        const canvas = document.createElement('canvas');
        const spy = spyOn(component, 'handleMouseMove').and.callFake(() => {
            return;
        });
        component.currentCanvas = canvas;
        component.handleCanvasEvent('mousemove', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle mouseup event', () => {
        const event = new MouseEvent('mouseup');
        const canvas = document.createElement('canvas');
        const spy = spyOn(component, 'handleMouseUp').and.callFake(() => {
            return;
        });
        component.currentCanvas = canvas;
        component.handleCanvasEvent('mouseup', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle mouseleave event', () => {
        const event = new MouseEvent('mouseleave');
        const canvas = document.createElement('canvas');
        const spy = spyOn(component, 'handleMouseLeave').and.callFake(() => {
            return;
        });
        component.currentCanvas = canvas;
        component.handleCanvasEvent('mouseleave', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle mouseenter event', () => {
        const event = new MouseEvent('mouseenter');
        const canvas = document.createElement('canvas');
        const spy = spyOn(component, 'handleMouseEnter').and.callFake(() => {
            return;
        });
        component.currentCanvas = canvas;
        component.handleCanvasEvent('mouseenter', event, canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('handleCanvasEvent should change context depending on the canvas', () => {
        const event = new MouseEvent('mouseup');
        const spy = spyOn(component, 'handleMouseUp').and.callFake(() => {
            return;
        });
        component.currentCanvas = component.canvas2.nativeElement;
        component.handleCanvasEvent('mouseup', event, component.canvas2.nativeElement);
        expect(spy).toHaveBeenCalled();
    });

    it('should enable the mode', () => {
        component.drawMode = DrawModes.PENCIL;
        component.mousePressed = true;
        component.enableMode(DrawModes.RECTANGLE);
        expect(component.drawMode).toEqual(DrawModes.RECTANGLE);
        expect(component.mousePressed).toBeFalse();
    });

    it('should update the display of canvas 1 when there is no background image', () => {
        component.urlPath1 = '';
        const spyClearRect = spyOn(component.context1, 'clearRect').and.callFake(() => {
            return;
        });
        const spyDrawImage = spyOn(component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        component.updateCanvas1Display();
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    });

    it('should update the display of canvas 1 when there is a background image', () => {
        component.urlPath1 = 'urlPath';
        const spy = spyOn(component, 'updateContext').and.callFake(() => {
            return;
        });
        component.updateCanvas1Display();
        expect(spy).toHaveBeenCalled();
    });

    it('should update the display of canvas 2', () => {
        component.urlPath2 = '';
        const spyClearRect = spyOn(component.context2, 'clearRect').and.callFake(() => {
            return;
        });
        const spyDrawImage = spyOn(component.context2, 'drawImage').and.callFake(() => {
            return;
        });
        component.updateCanvas2Display();
        expect(spyClearRect).toHaveBeenCalled();
        expect(spyDrawImage).toHaveBeenCalled();
    });

    it('should update the display of canvas 2 when there is a background image', () => {
        component.urlPath2 = 'urlPath';
        const spy = spyOn(component, 'updateContext').and.callFake(() => {
            return;
        });
        component.updateCanvas2Display();
        expect(spy).toHaveBeenCalled();
    });
});
