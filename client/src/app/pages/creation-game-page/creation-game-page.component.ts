import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreationDialogComponent } from '@app/components/creation-dialog/creation-dialog.component';
import { Canvas, DrawModes, ForegroundState, Rectangle } from '@app/interfaces/creation-game';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ForegroundService } from '@app/services/foreground/foreground.service';
import { ImageLoadService } from '@app/services/image-load/image-load.service';
import { Vec2 } from 'src/app/interfaces/vec2';
import { Color } from 'src/assets/variables/color';
import { DefaultSize } from 'src/assets/variables/default-size';
import { PossibleRadius } from 'src/assets/variables/images-values';
import { Dimensions } from 'src/assets/variables/picture-dimension';

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
    showColorPicker = false;
    showPencilThicknessPicker = false;
    showEraserThicknessPicker = false;
    mousePressed = false;
    mouseInCanvas = true;
    shiftPressed = false;
    belongsToCanvas1 = true;
    pencilSize = DefaultSize.Pencil;
    eraserSize = DefaultSize.Eraser;
    previousForegroundStates: ForegroundState[] = [];
    nextForegroundStates: ForegroundState[] = [];
    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    contextForeground1: CanvasRenderingContext2D;
    contextForeground2: CanvasRenderingContext2D;
    rectangleContext: CanvasRenderingContext2D;
    canvasForeground1: HTMLCanvasElement;
    canvasForeground2: HTMLCanvasElement;
    currentCanvas: HTMLCanvasElement;
    mousePosition: Vec2;
    rectangleState: Rectangle;
    canvasTemp: Canvas;
    image1: HTMLInputElement;
    image2: HTMLInputElement;
    drawMode = DrawModes.NOTHING;
    color = Color.Luigi as unknown as string;
    imageDifferencesUrl: string;
    urlPath1: string;
    urlPath2: string;
    nameGame: string;
    difficulty: string;
    differenceCount: number;
    width = Dimensions.DefaultWidth;
    height = Dimensions.DefaultHeight;
    radius = PossibleRadius.THREE;
    differenceMatrix: number[][];
    possibleRadius = [PossibleRadius.ZERO, PossibleRadius.THREE, PossibleRadius.NINE, PossibleRadius.FIFTEEN];
    dialogRef: MatDialogRef<CreationDialogComponent>;

    // eslint-disable-next-line max-params
    constructor(
        private foregroundService: ForegroundService,
        private drawingService: DrawingService,
        private imageLoadService: ImageLoadService,
        public dialog: MatDialog,
    ) {}

    get getForegroundService(): ForegroundService {
        return this.foregroundService;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'z' && event.ctrlKey) {
            this.undo();
        } else if (event.key === 'Z' && event.ctrlKey && event.shiftKey) {
            this.redo();
        } else if (event.shiftKey && !this.shiftPressed) {
            this.shiftPressed = true;
            if (this.mousePressed && this.drawMode === DrawModes.RECTANGLE) {
                this.drawingService.updateRectangle();
            }
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUpEvent(event: KeyboardEvent) {
        if (event.key === 'Shift') {
            this.shiftPressed = false;
            if (this.mousePressed && this.drawMode === DrawModes.RECTANGLE) {
                this.drawingService.updateRectangle();
            }
        }
    }

    ngAfterViewInit(): void {
        this.drawingService.setComponent(this);
        this.foregroundService.setComponent(this);
        this.imageLoadService.setComponent(this);

        this.setContexts();
        this.setForegroundContexts();

        this.mousePosition = { x: 0, y: 0 };
        this.setRectangleContext();
        this.setTempCanvas();

        this.foregroundService.clearRectWithWhite(this.context1);
        this.foregroundService.clearRectWithWhite(this.context2);
    }

    verifyImageFormat(e: Event, img: HTMLInputElement): void {
        this.imageLoadService.verifyImageFormat(e, img);
    }

    runDetectionSystem() {
        this.imageLoadService.runDetectionSystem();
    }

    updateRadius(newRadius: number) {
        this.radius = newRadius;
    }

    enableMode(mode: string) {
        this.drawMode = mode as DrawModes;
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

    invertForegrounds() {
        this.foregroundService.invertForegrounds();
    }

    handleCanvasEvent(eventType: string, event: MouseEvent, canvas: HTMLCanvasElement) {
        this.drawingService.handleCanvasEvent(eventType, event, canvas);
    }

    handleMouseUp() {
        this.drawingService.handleMouseUp();
    }

    undo() {
        this.drawingService.undo();
    }

    redo() {
        this.drawingService.redo();
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

    private setContexts() {
        const context1Init = this.canvas1.nativeElement.getContext('2d');
        if (context1Init) this.context1 = context1Init;
        const context2Init = this.canvas2.nativeElement.getContext('2d');
        if (context2Init) this.context2 = context2Init;
    }

    private setForegroundContexts() {
        this.canvasForeground1 = this.drawingService.createNewCanvas();
        this.canvasForeground2 = this.drawingService.createNewCanvas();

        const contextForeground1 = this.canvasForeground1.getContext('2d');
        if (contextForeground1) this.contextForeground1 = contextForeground1;
        const contextForeground2 = this.canvasForeground2.getContext('2d');
        if (contextForeground2) this.contextForeground2 = contextForeground2;
    }

    private setRectangleContext() {
        const canvasRectangle = this.drawingService.createNewCanvas();
        const contextRectangle = canvasRectangle.getContext('2d');
        if (contextRectangle) this.rectangleState = { canvas: canvasRectangle, context: contextRectangle, startPos: this.mousePosition };
    }

    private setTempCanvas() {
        const canvasTmp = this.drawingService.createNewCanvas();
        const canvasTmpCtx = canvasTmp.getContext('2d');
        if (canvasTmpCtx) this.canvasTemp = { canvas: canvasTmp, context: canvasTmpCtx };
    }
}
