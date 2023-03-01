/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { NewGame } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { Vec2 } from 'src/app/interfaces/vec2';
import { Color } from 'src/assets/variables/color';
import { AsciiLetterValue, BIT_PER_PIXEL, OffsetValues, PossibleRadius } from 'src/assets/variables/images-values';
import { MouseButton } from 'src/assets/variables/mouse-button';

enum DrawModes {
    PENCIL = 'pencil',
    RECTANGLE = 'rectangle',
    ERASER = 'eraser',
    NOTHING = '',
}

interface ForegroundState {
    layer: HTMLCanvasElement;
    belonging: boolean;
    swap: boolean;
}

interface Rectangle {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    startPos: Vec2;
}

interface Canvas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
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

    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;

    canvasForeground1: HTMLCanvasElement;
    canvasForeground2: HTMLCanvasElement;
    contextForeground1: CanvasRenderingContext2D;
    contextForeground2: CanvasRenderingContext2D;

    mousePosition: Vec2;
    eraserWidth: number;
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
    flipImage: boolean = false;

    dialogRef: MatDialogRef<ModalDialogComponent>;
    urlPath1: string;
    urlPath2: string;

    color: string = Color.Luigi;
    pencilSize: number;
    eraserSize: number;

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
        this.canvasForeground1 = this.createNewCanvas();
        this.canvasForeground2 = this.createNewCanvas();
        const contextForeground1 = this.canvasForeground1.getContext('2d');
        if (contextForeground1) this.contextForeground1 = contextForeground1;
        const contextForeground2 = this.canvasForeground2.getContext('2d');
        if (contextForeground2) this.contextForeground2 = contextForeground2;
        this.mousePosition = { x: 0, y: 0 };
        const canvasRectangle = this.createNewCanvas();
        const contextRectangle = canvasRectangle.getContext('2d');
        if (contextRectangle) this.rectangleState = { canvas: canvasRectangle, context: contextRectangle, startPos: this.mousePosition };
        const canvasTmp = this.createNewCanvas();
        const canvasTmpCtx = canvasTmp.getContext('2d');
        if (canvasTmpCtx) this.canvasTemp = { canvas: canvasTmp, context: canvasTmpCtx };
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
                this.emptyRedoStack();
                this.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.context1.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context1, this.canvasForeground1, this.urlPath1);
                break;
            }
            case this.canvas2.nativeElement: {
                this.currentCanvas = this.canvas2.nativeElement;
                this.pushToUndoStack();
                this.emptyRedoStack();
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
        this.emptyRedoStack();
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
        this.emptyRedoStack();
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
            this.emptyRedoStack();
            this.currentCanvas = canvas;
            this.pushToUndoStack();
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
                    this.handleMouseEnter(event);
                    break;
            }
        }
        this.updateCanvas1Display();
        this.updateCanvas2Display();
    }

    updateCanvas1Display() {
        if (this.urlPath1 === undefined || this.urlPath1 === '') {
            this.context1.clearRect(0, 0, this.width, this.height);
            this.context1.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
        } else {
            this.updateContext(this.context1, this.canvasForeground1, this.urlPath1);
        }
    }

    updateCanvas2Display() {
        if (this.urlPath2 === undefined || this.urlPath2 === '') {
            this.context2.clearRect(0, 0, this.width, this.height);
            this.context2.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
        } else {
            this.updateContext(this.context2, this.canvasForeground2, this.urlPath2);
        }
    }

    handleMouseDown(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.mousePressed = true;
            this.mouseInCanvas = true;
            switch (this.drawMode) {
                case DrawModes.PENCIL: {
                    context.fillStyle = this.color;
                    this.drawCircle(context, this.mousePosition);
                    break;
                }
                case DrawModes.RECTANGLE: {
                    this.rectangleState.context.fillStyle = this.color;
                    this.rectangleState.startPos = this.mousePosition;
                    this.canvasTemp.context.clearRect(0, 0, this.width, this.height);
                    if (context === this.contextForeground1) {
                        this.canvasTemp.context.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                    } else {
                        this.canvasTemp.context.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                    }
                    break;
                }
                case DrawModes.ERASER: {
                    this.eraserWidth = this.eraserSize;
                    this.eraseSquare(context, this.mousePosition);
                    break;
                }
                // No default
            }
        }
    }

    handleMouseMove(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (event.button === MouseButton.Left) {
            const finish: Vec2 = { x: event.offsetX, y: event.offsetY };

            if (this.mousePressed && this.mouseInCanvas) {
                switch (this.drawMode) {
                    case DrawModes.PENCIL: {
                        this.traceShape(context, this.mousePosition, finish);
                        break;
                    }
                    case DrawModes.RECTANGLE: {
                        this.drawRectangle(context, finish);
                        break;
                    }
                    case DrawModes.ERASER: {
                        this.traceShape(context, this.mousePosition, finish);
                        break;
                    }
                    // No default
                }
            }
        }
    }

    handleMouseUp() {
        this.mousePressed = false;
    }

    handleMouseLeave(event: MouseEvent, context: CanvasRenderingContext2D) {
        this.mouseInCanvas = false;
        this.mousePosition = { x: event.offsetX, y: event.offsetY };

        if (this.mousePressed) {
            const finish: Vec2 = { x: event.offsetX, y: event.offsetY };
            if (this.drawMode === DrawModes.PENCIL || this.drawMode === DrawModes.ERASER) {
                this.traceShape(context, this.mousePosition, finish);
            } else if (this.drawMode === DrawModes.RECTANGLE) {
                this.drawRectangle(context, finish);
            }
        }
    }

    handleMouseEnter(event: MouseEvent) {
        if (this.drawMode !== DrawModes.NOTHING) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.mouseInCanvas = true;
        }
    }

    drawRectangle(context: CanvasRenderingContext2D, pos: Vec2) {
        const x = this.rectangleState.startPos.x;
        const y = this.rectangleState.startPos.y;
        let width = pos.x - x;
        let height = pos.y - y;

        if (this.shiftPressed) {
            const length = Math.min(Math.abs(width), Math.abs(height));
            width = width < 0 ? -length : length;
            height = height < 0 ? -length : length;
        }
        this.rectangleState.context.clearRect(0, 0, this.width, this.height);
        this.rectangleState.context.fillRect(x, y, width, height);
        context.clearRect(0, 0, this.width, this.height);
        context.drawImage(this.canvasTemp.canvas, 0, 0, this.width, this.height);
        context.drawImage(this.rectangleState.canvas, 0, 0, this.width, this.height);
    }

    drawCircle(context: CanvasRenderingContext2D, position: Vec2) {
        context.beginPath();
        context.arc(position.x, position.y, this.pencilSize, 0, 2 * Math.PI);
        context.fill();
    }

    eraseSquare(context: CanvasRenderingContext2D, position: Vec2) {
        context.clearRect(position.x - this.eraserWidth, position.y - this.eraserWidth, 2 * this.eraserWidth, 2 * this.eraserWidth);
    }

    traceShape(context: CanvasRenderingContext2D, start: Vec2, finish: Vec2) {
        context.lineWidth = this.eraserWidth * 2;
        let slopeY = (finish.y - start.y) / (finish.x - start.x);
        if (start.x < finish.x) {
            for (let i = start.x; i <= finish.x; i++) {
                this.drawShape(context, { x: i, y: start.y + slopeY * (i - start.x) });
            }
        } else {
            slopeY = -slopeY;
            for (let i = start.x; i >= finish.x; i--) {
                this.drawShape(context, { x: i, y: start.y + slopeY * (start.x - i) });
            }
        }

        let slopeX = (finish.x - start.x) / (finish.y - start.y);
        if (start.y < finish.y) {
            for (let i = start.y; i <= finish.y; i++) {
                this.drawShape(context, { x: start.x + slopeX * (i - start.y), y: i });
            }
        } else {
            slopeX = -slopeX;
            for (let i = start.y; i >= finish.y; i--) {
                this.drawShape(context, { x: start.x + slopeX * (start.y - i), y: i });
            }
        }
        this.mousePosition = { x: finish.x, y: finish.y };
    }

    drawShape(context: CanvasRenderingContext2D, position: Vec2) {
        if (this.drawMode === DrawModes.PENCIL) {
            this.drawCircle(context, position);
        } else if (this.drawMode === DrawModes.ERASER) {
            this.eraseSquare(context, position);
        }
    }

    createNewCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        return canvas;
    }

    ctrlZ() {
        if (this.undo.length > 0) {
            const state = this.undo.pop();
            if (state?.swap) {
                this.swapForegrounds();
                this.redo.push({ layer: document.createElement('canvas'), belonging: true, swap: true });
            } else {
                const canvas = this.getCanvasAndUpdate(state);
                this.redo.push({ layer: canvas, belonging: this.belongsToCanvas1, swap: false });
            }
        }
    }

    ctrlShiftZ() {
        if (this.redo.length > 0) {
            const state = this.redo.pop();
            if (state?.swap) {
                this.swapForegrounds();
            } else {
                const canvas = this.getCanvasAndUpdate(state);
                this.undo.push({ layer: canvas, belonging: this.belongsToCanvas1, swap: false });
            }
        }
    }

    getCanvasAndUpdate(state: ForegroundState | undefined): HTMLCanvasElement {
        const layer = state?.layer;
        const canvas = this.createNewCanvas();
        const ctx = canvas.getContext('2d');
        if (layer) {
            if (state.belonging) {
                ctx?.drawImage(this.canvasForeground1, 0, 0, this.width, this.height);
                this.belongsToCanvas1 = true;
                this.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.contextForeground1.drawImage(layer, 0, 0, this.width, this.height);
                this.updateCanvas1Display();
            } else {
                ctx?.drawImage(this.canvasForeground2, 0, 0, this.width, this.height);
                this.belongsToCanvas1 = false;
                this.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.contextForeground2.drawImage(layer, 0, 0, this.width, this.height);
                this.updateCanvas2Display();
            }
        }
        return canvas;
    }

    pushToUndoStack() {
        const canvas = this.createNewCanvas();
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

    emptyRedoStack() {
        while (this.redo.length > 0) {
            this.redo.pop();
        }
    }

    ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
