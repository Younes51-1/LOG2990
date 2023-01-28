import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '@app/components/modal-dialog/modal-dialog.component';
import { DetectionDifferenceService } from '@app/services/detection-difference.service';

enum AsciiLetterValue {
    B = 66,
    M = 77,
}

enum OffsetValues {
    WIDTH = 18,
    HEIGHT = 22,
    DHP = 28,
}
const BIT_PER_PIXEL = 24;

enum PossibleRadius {
    ZERO = 0,
    THREE = 3,
    NINE = 9,
    FIFTEEN = 15,
}

@Component({
    selector: 'app-creation-game-page',
    templateUrl: './creation-game-page.component.html',
    styleUrls: ['./creation-game-page.component.scss'],
})
export class CreationGamePageComponent implements AfterViewInit {
    @ViewChild('image1', { static: false }) inputImage1: ElementRef;
    @ViewChild('image2', { static: false }) inputImage2: ElementRef;
    @ViewChild('images1et2', { static: false }) inputImages1et2: ElementRef;
    @ViewChild('canvas1', { static: false }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) canvas2: ElementRef<HTMLCanvasElement>;
    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    image1: HTMLInputElement;
    image2: HTMLInputElement;
    imageDifferencesUrl: string;
    nbImageFlipped: number = 0;
    width: number;
    height: number;
    radius: number = 3;
    differenceCount: number;
    possibleRadius: number[] = [PossibleRadius.ZERO, PossibleRadius.THREE, PossibleRadius.NINE, PossibleRadius.FIFTEEN];
    allowDisplayDiff: boolean = false;
    nameGame: string;
    constructor(public dialog: MatDialog, private detectionService: DetectionDifferenceService) {
        this.width = 640;
        this.height = 480;
    }

    async openDifferencesDialog() {
        await this.runDetectionSystem();
        this.dialog.open(ModalDialogComponent, {
            data: {
                imageUrl: this.imageDifferencesUrl,
                nbDifferences: this.differenceCount,
                nbImageFlipped: this.nbImageFlipped,
            },
        });
    }

    ngAfterViewInit(): void {
        const context1Init = this.canvas1.nativeElement.getContext('2d');
        if (context1Init) this.context1 = context1Init;
        const context2Init = this.canvas2.nativeElement.getContext('2d');
        if (context2Init) this.context2 = context2Init;
    }

    updateImageDisplay(event: Event, input: HTMLInputElement): void {
        if (event) {
            const file = (event.target as HTMLInputElement).files;
            if (file) {
                const urlPath = URL.createObjectURL(file[0]);
                if (input === this.inputImage1.nativeElement) {
                    this.updateContext(this.context1, urlPath);
                    this.image1 = this.inputImage1.nativeElement;
                }
                if (input === this.inputImage2.nativeElement) {
                    this.updateContext(this.context2, urlPath);
                    this.image2 = this.inputImage2.nativeElement;
                }
                if (input === this.inputImages1et2.nativeElement) {
                    this.updateContext(this.context1, urlPath);
                    this.updateContext(this.context2, urlPath);
                    this.image1 = this.image2 = this.inputImages1et2.nativeElement;
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
        this.updateDisplayDiffButton(false);
        if (file) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file[0]);
            reader.onload = () => {
                const width = Math.abs(new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.WIDTH, true));
                const height = Math.abs(new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.HEIGHT, true));
                const hasCorrectDimensions = width === this.width && height === this.height;
                const data = new Uint8Array(reader.result as ArrayBuffer);
                const isBmp = data[0] === AsciiLetterValue.B && data[1] === AsciiLetterValue.M;
                const is24BitPerPixel = data[OffsetValues.DHP] === BIT_PER_PIXEL;

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
                    if (new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.HEIGHT, true) < 0) {
                        this.nbImageFlipped++;
                    }
                }
            };
        }
    }

    async runDetectionSystem() {
        const img1Src: string = this.image1.value;
        const img2Src: string = this.image2.value;
        const img1HasContent: boolean = img1Src !== '';
        const img2HasContent: boolean = img2Src !== '';

        if (img1HasContent && img2HasContent) {
            const image1matrix: number[][] = await this.detectionService.readThenConvertImage(this.image1);
            const image2matrix: number[][] = await this.detectionService.readThenConvertImage(this.image2);

            this.differenceCount = this.detectionService.countDifferences(
                JSON.parse(JSON.stringify(image1matrix)),
                JSON.parse(JSON.stringify(image2matrix)),
                this.radius,
            );
            const differenceMatrix: number[][] = this.detectionService.diffrencesMatrix(image1matrix, image2matrix, this.radius);
            this.imageDifferencesUrl = this.detectionService.createDifferencesImage(differenceMatrix);
            this.updateDisplayDiffButton(true);
        }
    }

    updateRadius(newRadius: number) {
        this.radius = newRadius;
    }
    updateDisplayDiffButton(bool: boolean) {
        this.allowDisplayDiff = bool;
    }
    saveNameGame(name: string) {
        this.nameGame = name;
    }
    reset(): void {
        this.inputImage1.nativeElement.value = null;
        this.inputImage2.nativeElement.value = null;
        this.inputImages1et2.nativeElement.value = null;
        this.nbImageFlipped = 0;
        this.context1.clearRect(0, 0, this.canvas1.nativeElement.width, this.canvas1.nativeElement.height);
        this.context2.clearRect(0, 0, this.canvas2.nativeElement.width, this.canvas2.nativeElement.height);
        this.updateDisplayDiffButton(false);
    }
}
