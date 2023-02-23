import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { NewGame } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { AsciiLetterValue, BIT_PER_PIXEL, OffsetValues, PossibleRadius } from 'src/assets/variables/images-values';
import { MouseButton } from 'src/assets/variables/mouse-button';
import { Rectangle } from 'src/assets/variables/shapes';

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
        const contextForeground1Init = this.canvasForeground1.nativeElement.getContext('2d');
        if (contextForeground1Init) this.contextForeground1 = contextForeground1Init;
        const contextForeground2Init = this.canvasForeground2.nativeElement.getContext('2d');
        if (contextForeground2Init) this.contextForeground2 = contextForeground2Init;
    }

    updateImageDisplay(event: Event, input: HTMLInputElement): void {
        if (event) {
            const file = (event.target as HTMLInputElement).files;
            if (file) {
                const urlPath = URL.createObjectURL(file[0]);
                switch (input) {
                    case this.inputImage1.nativeElement: {
                        this.updateContext(this.context1, urlPath);
                        this.image1 = this.inputImage1.nativeElement;
                        break;
                    }
                    case this.inputImage2.nativeElement: {
                        this.updateContext(this.context2, urlPath);
                        this.image2 = this.inputImage2.nativeElement;
                        break;
                    }
                    case this.inputImages1et2.nativeElement: {
                        this.updateContext(this.context1, urlPath);
                        this.updateContext(this.context2, urlPath);
                        this.image1 = this.image2 = this.inputImages1et2.nativeElement;
                        break;
                    }
                    // No default
                }
            }
        }
    }

    updateContext(context: CanvasRenderingContext2D, background: string): void {
        const image = new Image();
        image.src = background;
        image.onload = () => {
            context.drawImage(image, 0, 0, this.width, this.height);
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
                this.context1.clearRect(0, 0, this.width, this.height);
                break;
            }
            case this.inputImage2.nativeElement: {
                this.inputImage2.nativeElement.value = null;
                this.context2.clearRect(0, 0, this.width, this.height);
                break;
            }
            case this.inputImages1et2.nativeElement: {
                this.inputImage1.nativeElement.value = null;
                this.inputImage2.nativeElement.value = null;
                this.inputImages1et2.nativeElement.value = null;
                this.context1.clearRect(0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                break;
            }
            case this.canvas1.nativeElement: {
                this.contextForeground1.clearRect(0, 0, this.width, this.height);
                break;
            }
            case this.canvas2.nativeElement: {
                this.contextForeground2.clearRect(0, 0, this.width, this.height);
                break;
            }
            // No default
        }
    }

    duplicateForeground(input: HTMLElement) {
        switch (input) {
            case this.canvas1.nativeElement: {
                this.contextForeground2.drawImage(this.canvasForeground1.nativeElement, this.width, this.height);
                break;
            }
            case this.canvas2.nativeElement: {
                this.contextForeground1.drawImage(this.canvasForeground2.nativeElement, this.width, this.height);
                break;
            }
            // No default
        }
    }

    swapForegrounds() {
        const canvasTemp = this.canvasForeground1.nativeElement;
        this.contextForeground1.drawImage(this.canvasForeground2.nativeElement, this.width, this.height);
        this.contextForeground2.drawImage(canvasTemp, this.width, this.height);
    }

    drawRectangle(event: MouseEvent) {
        // selon la position du click choisir sur quel avant-plan on travaille
        const rectangle: Rectangle = { location: { x: 0, y: 0 }, size: { width: this.width, height: this.height }, lineWidth: 2, color: 'maroon' };
        if (event.button === MouseButton.Left) {
            rectangle.location = { x: event.offsetX, y: event.offsetY };
            this.contextForeground1.fillStyle = 'white';
            this.contextForeground1.lineWidth = rectangle.lineWidth;
            this.contextForeground1.strokeStyle = 'black';
            this.contextForeground1.strokeRect(rectangle.location.x, rectangle.location.y, rectangle.size.width, rectangle.size.height);
        }
    }

    convertImageToB64Url(canvas: HTMLCanvasElement): string {
        return canvas.toDataURL().split(',')[1];
    }

    ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
