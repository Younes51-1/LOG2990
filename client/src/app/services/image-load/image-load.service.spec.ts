/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreationDialogComponent } from '@app/components/creation-dialog/creation-dialog.component';
import { GameData, NewGame } from '@app/interfaces/game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { ForegroundService } from '@app/services/foreground/foreground.service';
import { ImageLoadService } from '@app/services/image-load/image-load.service';
import { of, throwError } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('ImageLoadService', () => {
    let service: ImageLoadService;
    let fixture: ComponentFixture<CreationGamePageComponent>;
    let component: CreationGamePageComponent;
    let communicationServiceSpy: SpyObj<CommunicationHttpService>;
    let foregroundService: ForegroundService;

    let gameData: GameData;

    beforeEach(async () => {
        gameData = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulty: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
            ],
            differenceMatrix: [[]],
            vsBestTimes: [{ name: 'player1', time: 200 }],
        };
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getAllGames', 'getGame', 'createNewGame']);
        communicationServiceSpy.getAllGames.and.returnValue(
            of([
                {
                    name: 'Find the Differences 1',
                    nbDifference: 10,
                    image1url: 'https://example.com/image1.jpg',
                    image2url: 'https://example.com/image2.jpg',
                    difficulty: 'easy',
                    soloBestTimes: [
                        { name: 'player1', time: 200 },
                        { name: 'player2', time: 150 },
                    ],
                    differenceMatrix: [[]],
                    vsBestTimes: [{ name: 'player1', time: 200 }],
                },
                {
                    name: 'Find the Differences 2',
                    nbDifference: 15,
                    image1url: 'https://example.com/image3.jpg',
                    image2url: 'https://example.com/image4.jpg',
                    difficulty: 'medium',
                    soloBestTimes: [
                        { name: 'player3', time: 300 },
                        { name: 'player4', time: 250 },
                    ],
                    differenceMatrix: [[]],
                    vsBestTimes: [{ name: 'player3', time: 200 }],
                },
            ]),
        );
        communicationServiceSpy.createNewGame.and.returnValue(of());
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
                    provide: CommunicationHttpService,
                    useValue: communicationServiceSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ImageLoadService);
        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        (service as any).component = component;
        foregroundService = TestBed.inject(ForegroundService);
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changing image should call verifyImageFormat', () => {
        const spy = spyOn(component, 'verifyImageFormat');
        expect(spy).not.toHaveBeenCalled();
        const image = fixture.debugElement.nativeElement.querySelector('div > label > input');
        image.dispatchEvent(new Event('change'));
        expect(spy).toHaveBeenCalled();
    });

    it('openDifferencesDialog should open dialog', async () => {
        const spy = spyOn(component.dialog, 'open');
        (service as any).openDifferencesDialog();
        expect(spy).toHaveBeenCalledOnceWith(CreationDialogComponent, {
            data: {
                imageUrl: component.imageDifferencesUrl,
                nbDifferences: component.differenceCount,
            },
        });
    });

    it('should open Differences Dialog when image 1 and 2 has content', fakeAsync(() => {
        const spy = spyOn(service as any, 'openDifferencesDialog');
        component.image1 = { value: 'https://example.com/image3.jpg' } as HTMLInputElement;
        component.image2 = { value: 'https://example.com/image3.jpg' } as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).toHaveBeenCalled();
    }));

    it('should not open Differences Dialog if image2 has no content', fakeAsync(() => {
        const spy = spyOn(service as any, 'openDifferencesDialog');
        component.image1 = { value: 'https://example.com/image3.jpg' } as HTMLInputElement;
        component.image2 = { value: undefined } as unknown as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should not open Differences Dialog if image1 has no content', fakeAsync(() => {
        const spy = spyOn(service as any, 'openDifferencesDialog');
        component.image2 = { value: 'https://example.com/image3.jpg' } as HTMLInputElement;
        component.image1 = { value: undefined } as unknown as HTMLInputElement;
        component.runDetectionSystem();
        tick();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('save name game should set nameGame', () => {
        spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        const newGameName = 'newGameName';
        (service as any).saveNameGame(newGameName);
        expect(component.nameGame).toEqual(newGameName);
    });

    it('should call convert image to data url', () => {
        const canvas = document.createElement('canvas');
        const spy = spyOn(canvas, 'toDataURL').and.returnValue('fake,value');
        const res = (service as any).convertImageToB64Url(canvas);
        expect(spy).toHaveBeenCalled();
        expect(res).toEqual('value');
    });

    it('handleReaderOnload should call updateImageDisplay for valid image', () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(service as any, 'getImageData').and.returnValue({ hasCorrectDimensions: true, isBmp: true, is24BitPerPixel: true });
        const spy = spyOn(foregroundService, 'updateImageDisplay');

        (service as any).handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(spy).toHaveBeenCalledWith(mockEvent, mockImageElement);
    });

    it("handleReaderOnload should alert if image doesn't have correct dimmensions", () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(service as any, 'getImageData').and.returnValue({ hasCorrectDimensions: false, isBmp: true, is24BitPerPixel: true });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        (service as any).handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(window.alert).toHaveBeenCalledWith("Image refusée: elle n'est pas de taille 640x480");
    });

    it("handleReaderOnload should alert if image isn't a 24 bmp image", () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(service as any, 'getImageData').and.returnValue({ hasCorrectDimensions: true, isBmp: false, is24BitPerPixel: false });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        (service as any).handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(window.alert).toHaveBeenCalledWith('Image refusée: elle ne respecte pas le format BMP-24 bit');
    });

    it("handleReaderOnload should alert if image doesn't have correct dimmensions and isn't 24 bits bmp image", () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(service as any, 'getImageData').and.returnValue({ hasCorrectDimensions: false, isBmp: false, is24BitPerPixel: false });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        (service as any).handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect(window.alert).toHaveBeenCalledWith('Image refusée: elle ne respecte pas le format BMP-24 bit de taille 640x480');
    });

    it('handleReaderOnload should call getImageData', () => {
        const mockFileReader = new FileReader();
        const mockEvent = new Event('test');
        const mockImageElement = {
            value: '',
        } as HTMLInputElement;
        spyOn(service as any, 'getImageData').and.returnValue({ hasCorrectDimensions: false, isBmp: false, is24BitPerPixel: false });
        spyOn(foregroundService, 'updateImageDisplay');
        spyOn(window, 'alert');

        (service as any).handleReaderOnload(mockFileReader, mockEvent, mockImageElement);

        expect((service as any).getImageData).toHaveBeenCalledWith(mockFileReader);
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
        const res = (service as any).getImageData(mockReader);
        expect(res).toEqual({ hasCorrectDimensions: true, isBmp: true, is24BitPerPixel: true });
    }));
    /* eslint-enable @typescript-eslint/no-magic-numbers */

    it("shouldn't call saveNameGame after closing Matdialog if result is undefined", () => {
        const saveNameGameSpy = spyOn(service as any, 'saveNameGame');
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        const dialogRefSpy = jasmine.createSpyObj('MatDialog', ['afterClosed', 'close']);
        dialogSpy.open.and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of('test'));
        dialogRefSpy.close.and.returnValue(of('test'));
        (service as any).openDifferencesDialog();
        component.dialogRef.close();
        expect(component.dialogRef).toBeDefined();
        expect(saveNameGameSpy).not.toHaveBeenCalled();
    });

    it("should call saveNameGame after closing Matdialog if result isn't undefined", () => {
        const saveNameGameSpy = spyOn(service as any, 'saveNameGame');
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        (service as any).component.dialog = dialogSpy;
        const dialogRefSpy = jasmine.createSpyObj('MatDialog', ['afterClosed', 'close']);
        dialogSpy.open.and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of('test'));
        dialogRefSpy.close.and.returnValue(of('test'));
        (service as any).openDifferencesDialog();
        component.dialogRef.close();
        expect(component.dialogRef).toBeDefined();
        expect(saveNameGameSpy).toHaveBeenCalledWith('test');
    });

    it('should reset input value if file format is invalid', fakeAsync(() => {
        const readerAsArrayBufferSpy = spyOn(FileReader.prototype, 'readAsArrayBuffer');
        component.image2 = { value: 'https://example.com/image3.jpg' } as HTMLInputElement;
        const file = new File(['https://example.com/image3.jpg'], 'https://example.com/image3.jpg', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        component.verifyImageFormat(event, component.image2);
        tick();
        expect(readerAsArrayBufferSpy).toHaveBeenCalled();
    }));

    it("shouldn't call createNewGame only if getGame return undefined or null", () => {
        spyOn(service as any, 'convertImageToB64Url').and.returnValue('https://example.com/image3.jpg');
        (service as any).component.differenceCount = 0;
        (service as any).component.difficulty = 'facile';
        (service as any).component.differenceMatrix = [[]];
        communicationServiceSpy.getGame.and.returnValue(of(undefined as unknown as GameData));
        const newGame: NewGame = {
            name: 'test',
            image1: 'https://example.com/image3.jpg',
            image2: 'https://example.com/image3.jpg',
            nbDifference: 0,
            difficulty: 'facile',
            differenceMatrix: [[]],
        };
        gameData = null as unknown as GameData;
        (service as any).saveNameGame('test');
        expect(communicationServiceSpy.getGame).toHaveBeenCalledWith('test');
        expect(communicationServiceSpy.createNewGame).toHaveBeenCalledWith(newGame);
    });

    it("should call saveNameGame if getGame doesn't return undefined or null", () => {
        spyOn(service as any, 'convertImageToB64Url').and.returnValue('https://example.com/image3.jpg');
        (service as any).component.differenceCount = 0;
        (service as any).component.difficulty = 'facile';
        (service as any).component.differenceMatrix = [[]];
        spyOn(window, 'alert');
        (service as any).saveNameGame('test');
        expect(communicationServiceSpy.getGame).toHaveBeenCalledWith('test');
        expect(communicationServiceSpy.createNewGame).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Nom de jeu déjà utilisé');
    });

    it('should navigate to config in case createNewGame was successful', () => {
        spyOn(service as any, 'convertImageToB64Url').and.returnValue('https://example.com/image3.jpg');
        (service as any).component.differenceCount = 0;
        (service as any).component.difficulty = 'facile';
        (service as any).component.differenceMatrix = [[]];
        gameData = null as unknown as GameData;
        communicationServiceSpy.getGame.and.returnValue(of(undefined as unknown as GameData));
        communicationServiceSpy.createNewGame.and.returnValue(of(null as unknown as HttpResponse<string>));
        spyOn((service as any).router, 'navigate').and.returnValue(Promise.resolve(true));
        (service as any).saveNameGame('test');
        expect(communicationServiceSpy.getGame).toHaveBeenCalledWith('test');
        expect(communicationServiceSpy.createNewGame).toHaveBeenCalled();
        expect((service as any).router.navigate).toHaveBeenCalledWith(['/config']);
    });

    it('should alert in case createNewGame return null', () => {
        spyOn(service as any, 'convertImageToB64Url').and.returnValue('https://example.com/image3.jpg');
        (service as any).component.differenceCount = 0;
        (service as any).component.difficulty = 'facile';
        (service as any).component.differenceMatrix = [[]];
        spyOn(window, 'alert');
        gameData = null as unknown as GameData;
        communicationServiceSpy.getGame.and.returnValue(of(undefined as unknown as GameData));
        communicationServiceSpy.createNewGame.and.returnValue(
            throwError(() => {
                new Error('bad request');
            }),
        );
        (service as any).saveNameGame('test');
        expect(communicationServiceSpy.getGame).toHaveBeenCalledWith('test');
        expect(communicationServiceSpy.createNewGame).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Erreur lors de la création du jeu');
    });

    it("shouldn't runDetectionSystem if image1 or image2 is undefined", () => {
        (service as any).component.image1 = undefined as unknown as HTMLInputElement;
        (service as any).component.image2 = undefined as unknown as HTMLInputElement;
        (service as any).component.differenceMatrix = [];
        (service as any).component.differenceCount = 0;
        (service as any).component.difficulty = 'facile';
        const countDifferencesSpy = spyOn((service as any).detectionService, 'countDifferences');
        const createDifferencesImageSpy = spyOn((service as any).detectionService, 'createDifferencesImage');
        const computeLevelDifficultySpy = spyOn((service as any).detectionService, 'computeLevelDifficulty');
        (service as any).runDetectionSystem();
        expect(countDifferencesSpy).not.toHaveBeenCalled();
        expect(createDifferencesImageSpy).not.toHaveBeenCalled();
        expect(computeLevelDifficultySpy).not.toHaveBeenCalled();
    });

    it('should call handleReaderOnload on FileReader load', (done) => {
        const handleReaderOnloadSpy = spyOn(service as any, 'handleReaderOnload').and.callFake(() => {
            return;
        });
        const file = new File(['https://example.com/image3.jpg'], 'testFile', { type: 'image/bmp' });
        const event = { target: { files: [file] } } as unknown as Event;
        const inputElement = document.createElement('input');
        service.verifyImageFormat(event, inputElement);
        setTimeout(() => {
            expect(handleReaderOnloadSpy).toHaveBeenCalled();
            done();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1000);
    });

    it('should set component and width and height when setComponent()', () => {
        service.setComponent(component);
        expect((service as any).component).toEqual(component);
        expect((service as any).width).toEqual(component.width);
        expect((service as any).height).toEqual(component.height);
    });
});
