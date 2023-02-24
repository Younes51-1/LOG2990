/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
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
    @ViewChild('canvasForeground1', { static: false }) canvasForeground1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasForeground2', { static: false }) canvasForeground2: ElementRef<HTMLCanvasElement>;

    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    contextForeground1: CanvasRenderingContext2D;
    contextForeground2: CanvasRenderingContext2D;
    mousePosition: Vec2;
    pencilRadius: number;

    drawMode: string = DrawModes.ERASER;
    mousePressed: boolean = false;
    mouseInCanvas: boolean = true;

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
                        this.updateContext(this.context1, this.canvasForeground1.nativeElement, this.urlPath1);
                        this.image1 = this.inputImage1.nativeElement;
                        break;
                    }
                    case this.inputImage2.nativeElement: {
                        this.urlPath2 = urlPath;
                        this.updateContext(this.context2, this.canvasForeground2.nativeElement, this.urlPath2);
                        this.image2 = this.inputImage2.nativeElement;
                        break;
                    }
                    case this.inputImages1et2.nativeElement: {
                        this.urlPath1 = this.urlPath2 = urlPath;
                        this.updateContext(this.context1, this.canvasForeground1.nativeElement, this.urlPath1);
                        this.updateContext(this.context2, this.canvasForeground2.nativeElement, this.urlPath2);
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
                this.context1.drawImage(this.canvasForeground1.nativeElement, 0, 0, this.width, this.height);
                break;
            }
            case this.inputImage2.nativeElement: {
                this.inputImage2.nativeElement.value = null;
                this.urlPath2 = '';
                this.context2.clearRect(0, 0, this.width, this.height);
                this.context2.drawImage(this.canvasForeground2.nativeElement, 0, 0, this.width, this.height);
                break;
            }
            case this.inputImages1et2.nativeElement: {
                this.inputImage1.nativeElement.value = null;
                this.inputImage2.nativeElement.value = null;
                this.inputImages1et2.nativeElement.value = null;
                this.urlPath1 = this.urlPath2 = '';
                this.context1.clearRect(0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                this.context1.drawImage(this.canvasForeground1.nativeElement, 0, 0, this.width, this.height);
                this.context2.drawImage(this.canvasForeground2.nativeElement, 0, 0, this.width, this.height);
                break;
            }
            case this.canvas1.nativeElement: {
                this.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.context1.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context1, this.canvasForeground1.nativeElement, this.urlPath1);
                break;
            }
            case this.canvas2.nativeElement: {
                this.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context2, this.canvasForeground2.nativeElement, this.urlPath2);
                break;
            }
            // No default
        }
    }

    duplicateForeground(input: HTMLElement) {
        switch (input) {
            case this.canvas1.nativeElement: {
                this.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context2, this.canvasForeground2.nativeElement, this.urlPath2);
                this.contextForeground2.drawImage(this.canvasForeground1.nativeElement, 0, 0, this.width, this.height);
                this.context2.drawImage(this.canvasForeground1.nativeElement, 0, 0, this.width, this.height);
                break;
            }
            case this.canvas2.nativeElement: {
                this.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.context1.clearRect(0, 0, this.width, this.height);
                this.updateContext(this.context1, this.canvasForeground1.nativeElement, this.urlPath1);
                this.contextForeground1.drawImage(this.canvasForeground2.nativeElement, 0, 0, this.width, this.height);
                this.context1.drawImage(this.canvasForeground2.nativeElement, 0, 0, this.width, this.height);
                break;
            }
            // No default
        }
    }

    swapForegrounds() {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = this.width;
        canvasTemp.height = this.height;
        const contextTemp = canvasTemp.getContext('2d');
        contextTemp?.drawImage(this.canvasForeground1.nativeElement, 0, 0);

        this.contextForeground1.clearRect(0, 0, this.width, this.height);
        this.context1.clearRect(0, 0, this.width, this.height);
        this.updateContext(this.context1, this.canvasForeground1.nativeElement, this.urlPath1);
        this.contextForeground1.drawImage(this.canvasForeground2.nativeElement, 0, 0, this.width, this.height);
        this.context1.drawImage(this.canvasForeground2.nativeElement, 0, 0, this.width, this.height);

        this.contextForeground2.clearRect(0, 0, this.width, this.height);
        this.context2.clearRect(0, 0, this.width, this.height);
        this.updateContext(this.context2, this.canvasForeground2.nativeElement, this.urlPath2);
        this.contextForeground2.drawImage(canvasTemp, 0, 0, this.width, this.height);
        this.context2.drawImage(canvasTemp, 0, 0, this.width, this.height);
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
                this.context1.drawImage(this.canvasForeground1.nativeElement, 0, 0, this.width, this.height);
                break;
            }
            case this.canvas2.nativeElement: {
                this.contextForeground2.lineWidth = rectangle.lineWidth;
                this.contextForeground2.strokeStyle = 'green';
                this.contextForeground2.strokeRect(rectangle.location.x, rectangle.location.y, rectangle.size.width, rectangle.size.height);
                this.context2.drawImage(this.canvasForeground2.nativeElement, 0, 0, this.width, this.height);
                break;
            }
        }
    }

    convertImageToB64Url(canvas: HTMLCanvasElement): string {
        return canvas.toDataURL().split(',')[1];
    }

    enableMode(mode: string) {
        this.drawMode = mode;
        this.mousePressed = false;
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

    handleMouseDown(event: MouseEvent, canvas: HTMLCanvasElement) {
        if (event.button === MouseButton.Left) {
            if (this.drawMode === DrawModes.PENCIL) {
                const context = this.context1; // remplacer par le contexte approprie
                this.mousePosition = { x: event.offsetX, y: event.offsetY };
                this.mousePressed = true;
                this.drawWithPencil(context, this.mousePosition, this.mousePosition);
            } else if (this.drawMode === DrawModes.RECTANGLE) {
                this.drawRectangle(this.mousePosition, canvas);
            }
        }
    }

    handleMouseMove(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            if (this.drawMode === DrawModes.PENCIL) {
                const context = this.context1; // remplacer par le contexte approprie
                this.pencilRadius = 4; // a configurer ailleurs
                context.fillStyle = 'black';

                if (this.mousePressed && this.mouseInCanvas) {
                    const finish: Vec2 = { x: event.offsetX, y: event.offsetY };
                    this.drawWithPencil(context, this.mousePosition, finish);
                }
            }
        }
    }

    handleMouseLeave(event: MouseEvent) {
        if (this.drawMode === DrawModes.PENCIL) {
            if (this.mousePressed) {
                const context = this.context1; // remplacer par le contexte approprie
                const finish: Vec2 = { x: event.offsetX, y: event.offsetY };
                this.drawWithPencil(context, this.mousePosition, finish);
            }
            this.mouseInCanvas = false;
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
    }

    handleMouseEnter(event: MouseEvent) {
        if (this.drawMode === DrawModes.PENCIL) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.mouseInCanvas = true;
            const leftClickPressed = 1;
            if (event.buttons !== leftClickPressed) {
                this.mousePressed = false;
                // fin de l'action pour annuler-refaire
                // attention au ctrl+Z si l'utilisateur lache la souris en dehors du canvas et ne re-entre pas
                // (marquer la fin du dessin avant de ctrl+Z)
            }
        }
    }

    handleMouseUp() {
        this.mousePressed = false;
        // fin de l'action pour annuler-refaire
    }

    ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
