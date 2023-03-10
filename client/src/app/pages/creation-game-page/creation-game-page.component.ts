import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { Canvas, DrawModes, ForegroundState, Rectangle } from '@app/interfaces/creation-game';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { DrawingService } from '@app/services/drawingService/drawing.service';
import { ForegroundService } from '@app/services/foregroundService/foreground.service';
import { ImageLoadService } from '@app/services/imageLoad/image-load.service';
import { Vec2 } from 'src/app/interfaces/vec2';
import { Color } from 'src/assets/variables/color';
import { DefaultSize } from 'src/assets/variables/default-size';
import { PossibleRadius } from 'src/assets/variables/images-values';

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
    rectangleContext: CanvasRenderingContext2D;
    currentCanvas: HTMLCanvasElement;
    width: number;
    height: number;

    mousePosition: Vec2;
    rectangleState: Rectangle;
    canvasTemp: Canvas;
    drawMode: string;
    mousePressed: boolean;
    mouseInCanvas: boolean;
    shiftPressed: boolean;
    belongsToCanvas1: boolean;

    undo: ForegroundState[] = [];
    redo: ForegroundState[] = [];

    image1: HTMLInputElement;
    image2: HTMLInputElement;
    imageDifferencesUrl: string;
    urlPath1: string;
    urlPath2: string;

    color: string;
    pencilSize: number;
    eraserSize: number;

    radius: number;
    possibleRadius: number[];

    differenceCount: number;
    differenceMatrix: number[][];
    nameGame: string;
    difficulty: string;
    dialogRef: MatDialogRef<ModalDialogComponent>;

    // eslint-disable-next-line max-params -- needed for constructor
    constructor(
        private communicationService: CommunicationService,
        public dialog: MatDialog,
        public detectionService: DetectionDifferenceService,
        private foregroundService: ForegroundService,
        private drawingService: DrawingService,
        private imageLoadService: ImageLoadService,
        private router: Router,
    ) {
        this.width = 640;
        this.height = 480;
        this.mousePressed = false;
        this.mouseInCanvas = true;
        this.shiftPressed = false;
        this.belongsToCanvas1 = true;
        this.drawMode = DrawModes.NOTHING;
        this.possibleRadius = [PossibleRadius.ZERO, PossibleRadius.THREE, PossibleRadius.NINE, PossibleRadius.FIFTEEN];
        this.radius = 3;
        this.color = Color.Luigi;
        this.pencilSize = DefaultSize.Pencil;
        this.eraserSize = DefaultSize.Eraser;
    }

    get getRouter(): Router {
        return this.router;
    }

    get getForegroundService(): ForegroundService {
        return this.foregroundService;
    }

    get getCommunicationService(): CommunicationService {
        return this.communicationService;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'z' && event.ctrlKey) {
            this.ctrlZ();
        } else if (event.key === 'Z' && event.ctrlKey && event.shiftKey) {
            this.ctrlShiftZ();
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
        this.imageLoadService.verifyImageFormat(e, img);
    }

    async runDetectionSystem() {
        this.imageLoadService.runDetectionSystem();
    }

    updateRadius(newRadius: number) {
        this.radius = newRadius;
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
