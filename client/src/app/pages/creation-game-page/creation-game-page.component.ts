/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { NewGame } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { Vec2 } from 'src/app/interfaces/vec2';
import { AsciiLetterValue, BIT_PER_PIXEL, OffsetValues, PossibleRadius } from 'src/assets/variables/images-values';
import { MouseButton } from 'src/assets/variables/mouse-button';
import { Rectangle } from 'src/assets/variables/shapes';

enum DrawModes {
    PENCIL = 'pencil',
    RECTANGLE = 'rectangle',
    ERASER = 'eraser',
}

interface ForegroundState {
    layer: HTMLCanvasElement;
    belonging: boolean;
    swap: boolean;
}

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

    canvasForeground1: HTMLCanvasElement;
    canvasForeground2: HTMLCanvasElement;

    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    contextForeground1: CanvasRenderingContext2D;
    contextForeground2: CanvasRenderingContext2D;
    mousePosition: Vec2;
    pencilRadius: number;

    drawMode: string = DrawModes.ERASER;
    mousePressed: boolean = false;
    mouseInCanvas: boolean = true;
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
    flipImage: boolean = false;

    dialogRef: MatDialogRef<ModalDialogComponent>;
    urlPath1: string;
    urlPath2: string;

    // eslint-disable-next-line max-params -- needed for constructor
    constructor(
        private communicationService: CommunicationService,
        public dialog: MatDialog,
        public detectionService: DetectionDifferenceService,
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
        }
    }

    async openDifferencesDialog() {
        this.dialogRef = this.dialog.open(ModalDialogComponent, {
            data: {
                imageUrl: this.imageDifferencesUrl,
                nbDifferences: this.differenceCount,
                flipped: this.flipImage,
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
        const context1Init = this.canvas1.nativeElement.getContext('2d');
        if (context1Init) this.context1 = context1Init;
        const context2Init = this.canvas2.nativeElement.getContext('2d');
        if (context2Init) this.context2 = context2Init;
        this.canvasForeground1 = document.createElement('canvas');
        this.canvasForeground2 = document.createElement('canvas');
        this.canvasForeground1.width = this.width;
        this.canvasForeground1.height = this.height;
        this.canvasForeground2.width = this.width;
        this.canvasForeground2.height = this.height;
        const contextForeground1 = this.canvasForeground1.getContext('2d');
        if (contextForeground1) this.contextForeground1 = contextForeground1;
        const contextForeground2 = this.canvasForeground2.getContext('2d');
        if (contextForeground2) this.contextForeground2 = contextForeground2;
        this.mousePosition = { x: 0, y: 0 };
    }

    updateImageDisplay(event: Event, input: HTMLInputElement): void {
        if (event) {
            const file = (event.target as HTMLInputElement).files;
            if (file) {
                const urlPath = URL.createObjectURL(file[0]);
                switch (input) {
                    case this.inputImage1.nativeElement: {
                        this.urlPath1 = urlPath;
                        this.updateContext(this.context1, this.canvasForeground1, this.urlPath1);
                        this.image1 = this.inputImage1.nativeElement;
                        break;
                    }
                    case this.inputImage2.nativeElement: {
                        this.urlPath2 = urlPath;
                        this.updateContext(this.context2, this.canvasForeground2, this.urlPath2);
                        this.image2 = this.inputImage2.nativeElement;
                        break;
                    }
                    case this.inputImages1et2.nativeElement: {
                        this.urlPath1 = this.urlPath2 = urlPath;
                        this.updateContext(this.context1, this.canvasForeground1, this.urlPath1);
                        this.updateContext(this.context2, this.canvasForeground2, this.urlPath2);
                        this.image1 = this.image2 = this.inputImages1et2.nativeElement;
                        break;
                    }
                    // No default
                }
            }
        }
    }

    updateContext(context: CanvasRenderingContext2D, canvasForeground: HTMLCanvasElement, background: string): void {
        const image = new Image();
        image.src = background;
        image.onload = () => {
            context.drawImage(image, 0, 0, this.width, this.height);
            context.drawImage(canvasForeground, 0, 0, this.width, this.height);
        };
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
        this.flipImage = new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.HEIGHT, true) < 0;

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
            this.updateImageDisplay(e, img);
        }
    }

    async runDetectionSystem() {
        const img1HasContent: boolean = this.image1?.value !== undefined;
        const img2HasContent: boolean = this.image2?.value !== undefined;

        if (img1HasContent && img2HasContent) {
            const image1matrix: number[][] = await this.detectionService.readThenConvertImage(this.image1);
            const image2matrix: number[][] = await this.detectionService.readThenConvertImage(this.image2);

            this.differenceCount = this.detectionService.countDifferences(
                JSON.parse(JSON.stringify(image1matrix)),
                JSON.parse(JSON.stringify(image2matrix)),
                this.radius,
            );
            this.differenceMatrix = this.detectionService.differencesMatrix(image1matrix, image2matrix, this.radius);
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
            differenceMatrix: this.flipImage ? this.differenceMatrix.reverse() : this.differenceMatrix,
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

    reset(input: HTMLElement): void {
        switch (input) {
            case this.inputImage1.nativeElement: {
                this.inputImage1.nativeElement.value = null;
                this.urlPath1 = '';
                this.context1.clearRect(0, 0, this.width, this.height);
                this.context1.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                break;
            }
            case this.inputImage2.nativeElement: {
                this.inputImage2.nativeElement.value = null;
                this.urlPath2 = '';
                this.context2.clearRect(0, 0, this.width, this.height);
                this.context2.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                break;
            }
            case this.inputImages1et2.nativeElement: {
                this.inputImage1.nativeElement.value = null;
                this.inputImage2.nativeElement.value = null;
                this.inputImages1et2.nativeElement.value = null;
                this.urlPath1 = this.urlPath2 = '';
                this.context1.clearRect(0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                this.context1.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                this.context2.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                break;
            }
            case this.canvas1.nativeElement: {
                this.currentCanvas = this.canvas1.nativeElement;
                this.pushToUndoStack();
                this.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.context1.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context1, this.canvasForeground1, this.urlPath1);
                break;
            }
            case this.canvas2.nativeElement: {
                this.currentCanvas = this.canvas2.nativeElement;
                this.pushToUndoStack();
                this.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context2, this.canvasForeground2, this.urlPath2);
                break;
            }
            // No default
        }
    }

    convertImageToB64Url(canvas: HTMLCanvasElement): string {
        return canvas.toDataURL().split(',')[1];
    }

    enableMode(mode: string) {
        this.drawMode = mode;
        this.mousePressed = false;
    }

    duplicateForeground(input: HTMLCanvasElement) {
        switch (input) {
            case this.canvas1.nativeElement: {
                this.currentCanvas = this.canvas2.nativeElement;
                this.pushToUndoStack();
                this.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context2, this.canvasForeground2, this.urlPath2);
                this.contextForeground2.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                this.context2.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                break;
            }
            case this.canvas2.nativeElement: {
                this.currentCanvas = this.canvas1.nativeElement;
                this.pushToUndoStack();
                this.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.context1.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context1, this.canvasForeground1, this.urlPath1);
                this.contextForeground1.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                this.context1.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                break;
            }
            // No default
        }
    }

    pushAndSwapForegrounds() {
        this.undo.push({ layer: document.createElement('canvas'), belonging: true, swap: true });
        this.swapForegrounds();
    }

    swapForegrounds() {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = this.width;
        canvasTemp.height = this.height;
        const contextTemp = canvasTemp.getContext('2d');
        contextTemp?.drawImage(this.canvasForeground1, 0, 0);

        this.contextForeground1.clearRect(0, 0, this.width, this.height);
        this.context1.clearRect(0, 0, this.width, this.height);
        this.updateContext(this.context1, this.canvasForeground1, this.urlPath1);
        this.contextForeground1.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
        this.context1.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);

        this.contextForeground2.clearRect(0, 0, this.width, this.height);
        this.context2.clearRect(0, 0, this.width, this.height);
        this.updateContext(this.context2, this.canvasForeground2, this.urlPath2);
        this.contextForeground2.drawImage(canvasTemp, 0, 0, this.width, this.height);
        this.context2.drawImage(canvasTemp, 0, 0, this.width, this.height);
    }

    handleCanvasEvent(eventType: string, event: MouseEvent, canvas: HTMLCanvasElement) {
        if (eventType === 'mousedown') {
            this.currentCanvas = canvas;
        }

        if (this.currentCanvas === canvas) {
            let context = this.contextForeground1;
            if (canvas === this.canvas2.nativeElement) {
                context = this.contextForeground2;
            }

            switch (eventType) {
                case 'mousedown':
                    this.handleMouseDown(event, context);
                    break;
                case 'mousemove':
                    this.handleMouseMove(event, context);
                    break;
                case 'mouseup':
                    this.handleMouseUp();
                    break;
                case 'mouseleave':
                    this.handleMouseLeave(event, context);
                    break;
                case 'mouseenter':
                    this.handleMouseEnter(event, context);
                    break;
            }
        }
        this.context1.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
        this.context2.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
    }

    handleMouseDown(event: MouseEvent, context: CanvasRenderingContext2D) {
        this.pushToUndoStack();

        if (event.button === MouseButton.Left) {
            if (this.drawMode === DrawModes.PENCIL) {
                this.mousePosition = { x: event.offsetX, y: event.offsetY };
                this.mousePressed = true;
                this.mouseInCanvas = true;
                this.drawWithPencil(context, this.mousePosition, this.mousePosition);
            } else if (this.drawMode === DrawModes.RECTANGLE) {
                // this.drawRectangle(this.mousePosition, canvas);
            }
        }
    }

    handleMouseMove(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (event.button === MouseButton.Left) {
            if (this.drawMode === DrawModes.PENCIL) {
                this.pencilRadius = 4; // a configurer ailleurs
                context.fillStyle = 'black';

                if (this.mousePressed && this.mouseInCanvas) {
                    const finish: Vec2 = { x: event.offsetX, y: event.offsetY };
                    this.drawWithPencil(context, this.mousePosition, finish);
                }
            }
        }
    }

    // fin de l'action pour annuler-refaire
    handleMouseUp() {
        this.mousePressed = false;
    }

    handleMouseLeave(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.drawMode === DrawModes.PENCIL) {
            if (this.mousePressed) {
                const finish: Vec2 = { x: event.offsetX, y: event.offsetY };
                this.drawWithPencil(context, this.mousePosition, finish);
            }
            this.mouseInCanvas = false;
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
    }

    handleMouseEnter(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.drawMode === DrawModes.PENCIL) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.mouseInCanvas = true;
        }
    }

    drawWithPencil(context: CanvasRenderingContext2D, start: Vec2, finish: Vec2) {
        context.lineWidth = this.pencilRadius * 2;
        context.lineJoin = 'round';
        context.beginPath();
        context.arc(start.x, start.y, this.pencilRadius, 0, 2 * Math.PI, true);
        const oldCoords: Vec2 = { x: this.mousePosition.x, y: this.mousePosition.y };
        this.mousePosition = { x: finish.x, y: finish.y };
        context.arc(this.mousePosition.x, this.mousePosition.y, this.pencilRadius, 0, 2 * Math.PI, true);
        context.fill();
        context.beginPath();
        context.moveTo(oldCoords.x, oldCoords.y);
        context.lineTo(this.mousePosition.x, this.mousePosition.y);
        context.stroke();
    }

    drawRectangle(mousePos: Vec2, input: HTMLCanvasElement) {
        const rectangle: Rectangle = {
            location: { x: mousePos.x, y: mousePos.y },
            size: { width: 20, height: 40 },
            lineWidth: 2,
            color: 'maroon',
        };
        switch (input) {
            case this.canvas1.nativeElement: {
                this.contextForeground1.lineWidth = rectangle.lineWidth;
                this.contextForeground1.strokeStyle = rectangle.color;
                this.contextForeground1.strokeRect(rectangle.location.x, rectangle.location.y, rectangle.size.width, rectangle.size.height);
                this.context1.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                break;
            }
            case this.canvas2.nativeElement: {
                this.contextForeground2.lineWidth = rectangle.lineWidth;
                this.contextForeground2.strokeStyle = 'green';
                this.contextForeground2.strokeRect(rectangle.location.x, rectangle.location.y, rectangle.size.width, rectangle.size.height);
                this.context2.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                break;
            }
        }
    }

    pushToUndoStack() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        if (this.currentCanvas === this.canvas1.nativeElement) {
            ctx?.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
            this.belongsToCanvas1 = true;
        } else {
            ctx?.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
            this.belongsToCanvas1 = false;
        }
        this.undo.push({ layer: canvas, belonging: this.belongsToCanvas1, swap: false });
    }

    ctrlZ() {
        if (this.undo.length > 0) {
            const state = this.undo.pop();
            if (state?.swap) {
                this.swapForegrounds();
            } else {
                const layer = state?.layer;
                if (layer) {
                    if (state.belonging) {
                        this.contextForeground1.clearRect(0, 0, this.width, this.height);
                        this.context1.clearRect(0, 0, this.width, this.height);
                        this.contextForeground1.drawImage(layer, 0, 0, this.width, this.height);
                        this.context1.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                        // TODO: redraw actual image
                    } else {
                        this.contextForeground2.clearRect(0, 0, this.width, this.height);
                        this.context2.clearRect(0, 0, this.width, this.height);
                        this.contextForeground2.drawImage(layer, 0, 0, this.width, this.height);
                        this.context2.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                        // TODO:redraw actual image
                    }
                }
            }
        }
    }

    // TODO
    ctrlShiftZ() {}

    ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
