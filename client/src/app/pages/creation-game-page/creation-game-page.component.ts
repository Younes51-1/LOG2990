/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { Canvas, DrawModes, ForegroundState, Rectangle } from '@app/interfaces/creation-game';
import { NewGame } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { DrawingService } from '@app/services/drawingService/drawing.service';
import { ForegroundService } from '@app/services/foregroundService/foreground.service';
import { Vec2 } from 'src/app/interfaces/vec2';
import { Color } from 'src/assets/variables/color';
import { DefaultSize } from 'src/assets/variables/default-size';
import { AsciiLetterValue, BIT_PER_PIXEL, OffsetValues, PossibleRadius } from 'src/assets/variables/images-values';

@Component({
    selector: 'app-creation-game-page',
    templateUrl: './creation-game-page.component.html',
    styleUrls: ['./creation-game-page.component.scss'],
})
export class CreationGamePageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('image1', { static: false }) inputImage1: ElementRef;
    @ViewChild('image2', { static: false }) inputImage2: ElementRef;
    @ViewChild('images1et2', { static: false }) inputImages1et2: ElementRef;
    @ViewChild('canvas1', { static: false }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) canvas2: ElementRef<HTMLCanvasElement>;

    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;

    canvasForeground1: HTMLCanvasElement;
    canvasForeground2: HTMLCanvasElement;
    contextForeground1: CanvasRenderingContext2D;
    contextForeground2: CanvasRenderingContext2D;

    mousePosition: Vec2;
    rectangleState: Rectangle;
    canvasTemp: Canvas;
    drawMode: string = DrawModes.NOTHING;
    mousePressed: boolean = false;
    mouseInCanvas: boolean = true;
    shiftPressed: boolean = false;
    belongsToCanvas1: boolean = true;
    currentCanvas: HTMLCanvasElement;

    undo: ForegroundState[] = [];
    redo: ForegroundState[] = [];

    image1: HTMLInputElement;
    image2: HTMLInputElement;

    imageDifferencesUrl: string;
    width: number;
    height: number;

    radius: number = 3;
    possibleRadius: number[] = [PossibleRadius.ZERO, PossibleRadius.THREE, PossibleRadius.NINE, PossibleRadius.FIFTEEN];

    differenceCount: number;

    differenceMatrix: number[][];
    nameGame: string;
    difficulty: string;

    dialogRef: MatDialogRef<ModalDialogComponent>;
    urlPath1: string;
    urlPath2: string;

    color: string = Color.Luigi;
    pencilSize: number = DefaultSize.Pencil;
    eraserSize: number = DefaultSize.Eraser;

    // eslint-disable-next-line max-params -- needed for constructor
    constructor(
        private communicationService: CommunicationService,
        public dialog: MatDialog,
        public detectionService: DetectionDifferenceService,
        private foregroundService: ForegroundService,
        private drawingService: DrawingService,
        private router: Router,
    ) {
        this.width = 640;
        this.height = 480;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'z' && event.ctrlKey) {
            this.ctrlZ();
        } else if (event.key === 'Z' && event.ctrlKey && event.shiftKey) {
            this.ctrlShiftZ();
        } else if (event.shiftKey) {
            this.shiftPressed = true;
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUpEvent(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            this.shiftPressed = false;
        }
    }

    async openDifferencesDialog() {
        this.dialogRef = this.dialog.open(ModalDialogComponent, {
            data: {
                imageUrl: this.imageDifferencesUrl,
                nbDifferences: this.differenceCount,
            },
        });
        if (this.dialogRef) {
            this.dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.saveNameGame(result);
                }
            });
        }
    }

    ngAfterViewInit(): void {
        this.drawingService.setComponent(this);
        this.foregroundService.setComponent(this);
        const context1Init = this.canvas1.nativeElement.getContext('2d');
        if (context1Init) this.context1 = context1Init;
        const context2Init = this.canvas2.nativeElement.getContext('2d');
        if (context2Init) this.context2 = context2Init;
        this.canvasForeground1 = this.drawingService.createNewCanvas();
        this.canvasForeground2 = this.drawingService.createNewCanvas();
        const contextForeground1 = this.canvasForeground1.getContext('2d');
        if (contextForeground1) this.contextForeground1 = contextForeground1;
        const contextForeground2 = this.canvasForeground2.getContext('2d');
        if (contextForeground2) this.contextForeground2 = contextForeground2;
        this.mousePosition = { x: 0, y: 0 };
        const canvasRectangle = this.drawingService.createNewCanvas();
        const contextRectangle = canvasRectangle.getContext('2d');
        if (contextRectangle) this.rectangleState = { canvas: canvasRectangle, context: contextRectangle, startPos: this.mousePosition };
        const canvasTmp = this.drawingService.createNewCanvas();
        const canvasTmpCtx = canvasTmp.getContext('2d');
        if (canvasTmpCtx) this.canvasTemp = { canvas: canvasTmp, context: canvasTmpCtx };
    }

    verifyImageFormat(e: Event, img: HTMLInputElement): void {
        const file = (e.target as HTMLInputElement).files;
        if (file) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file[0]);
            reader.onload = () => {
                this.handleReaderOnload(reader, e, img);
            };
        }
    }

    getImageData(reader: FileReader) {
        const width = Math.abs(new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.WIDTH, true));
        const height = Math.abs(new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.HEIGHT, true));
        const data = new Uint8Array(reader.result as ArrayBuffer);

        const hasCorrectDimensions = width === this.width && height === this.height;
        const isBmp = data[0] === AsciiLetterValue.B && data[1] === AsciiLetterValue.M;
        const is24BitPerPixel = data[OffsetValues.DHP] === BIT_PER_PIXEL.BIT_PER_PIXEL;

        return { hasCorrectDimensions, isBmp, is24BitPerPixel };
    }

    handleReaderOnload(reader: FileReader, e: Event, img: HTMLInputElement): void {
        const { hasCorrectDimensions, isBmp, is24BitPerPixel } = this.getImageData(reader);
        if (!(isBmp && is24BitPerPixel) || !hasCorrectDimensions) {
            img.value = '';
        }
        if (!hasCorrectDimensions && !(isBmp && is24BitPerPixel)) {
            alert('Image refusée: elle ne respecte pas le format BMP-24 bit de taille 640x480');
        } else if (!hasCorrectDimensions) {
            alert("Image refusée: elle n'est pas de taille 640x480");
        } else if (!(isBmp && is24BitPerPixel)) {
            alert('Image refusée: elle ne respecte pas le format BMP-24 bit');
        } else {
            this.foregroundService.updateImageDisplay(e, img);
        }
    }

    async runDetectionSystem() {
        const img1HasContent: boolean = this.image1?.value !== undefined;
        const img2HasContent: boolean = this.image2?.value !== undefined;

        if ((img1HasContent && img2HasContent) || this.undo.length > 0) {
            this.differenceMatrix = this.detectionService.generateDifferencesMatrix(this.context1, this.context2, this.radius);
            this.differenceCount = this.detectionService.countDifferences(this.differenceMatrix);
            this.imageDifferencesUrl = this.detectionService.createDifferencesImage(this.differenceMatrix);
            this.difficulty = this.detectionService.computeLevelDifficulty(this.differenceCount, JSON.parse(JSON.stringify(this.differenceMatrix)));
            this.openDifferencesDialog();
        }
    }

    updateRadius(newRadius: number) {
        this.radius = newRadius;
    }

    saveNameGame(name: string) {
        this.nameGame = name;
        const newGame: NewGame = {
            name,
            image1: this.convertImageToB64Url(this.canvas1.nativeElement),
            image2: this.convertImageToB64Url(this.canvas2.nativeElement),
            nbDifference: this.differenceCount,
            difficulty: this.difficulty,
            differenceMatrix: this.differenceMatrix,
        };
        this.communicationService.getGame(newGame.name).subscribe((res) => {
            if (!res.gameForm) {
                this.communicationService.createNewGame(newGame).subscribe({
                    next: () => {
                        this.router.navigate(['/config']);
                    },
                    error: () => {
                        alert('Erreur lors de la création du jeu');
                    },
                });
            } else {
                alert('Nom de jeu déjà utilisé');
            }
        });
    }

    convertImageToB64Url(canvas: HTMLCanvasElement): string {
        return canvas.toDataURL().split(',')[1];
    }

    enableMode(mode: string) {
        this.drawMode = mode;
        this.mousePressed = false;
    }

    updateContext(context: CanvasRenderingContext2D, canvasForeground: HTMLCanvasElement, background: string) {
        this.foregroundService.updateContext(context, canvasForeground, background);
    }

    swapForegrounds() {
        this.foregroundService.swapForegrounds();
    }

    reset(element: HTMLElement) {
        this.foregroundService.reset(element);
    }

    duplicateForeground(input: HTMLCanvasElement) {
        this.foregroundService.duplicateForeground(input);
    }

    pushAndSwapForegrounds() {
        this.foregroundService.pushAndSwapForegrounds();
    }

    handleCanvasEvent(eventType: string, event: MouseEvent, canvas: HTMLCanvasElement) {
        this.drawingService.handleCanvasEvent(eventType, event, canvas);
    }

    handleMouseUp() {
        this.drawingService.handleMouseUp();
    }

    ctrlZ() {
        this.drawingService.ctrlZ();
    }

    ctrlShiftZ() {
        this.drawingService.ctrlShiftZ();
    }

    pushToUndoStack() {
        this.drawingService.pushToUndoStack();
    }

    emptyRedoStack() {
        this.drawingService.emptyRedoStack();
    }

    ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
