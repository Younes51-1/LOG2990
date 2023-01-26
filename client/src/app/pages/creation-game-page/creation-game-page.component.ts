import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-creation-game-page',
    templateUrl: './creation-game-page.component.html',
    styleUrls: ['./creation-game-page.component.scss'],
})
export class CreationGamePageComponent implements AfterViewInit {
    @ViewChild('image1', { static: false }) image1: ElementRef;
    @ViewChild('image2', { static: false }) image2: ElementRef;
    @ViewChild('images1et2', { static: false }) images1et2: ElementRef;
    @ViewChild('canvas1', { static: false }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) canvas2: ElementRef<HTMLCanvasElement>;
    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    width: number;
    height: number;
    background1: string;
    background2: string;

    constructor() {
        this.width = 640;
        this.height = 480;
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
                if (input === this.image1.nativeElement) {
                    this.background1 = URL.createObjectURL(file[0]);
                    this.updateContext(this.context1, this.background1);
                }
                if (input === this.image2.nativeElement) {
                    this.background2 = URL.createObjectURL(file[0]);
                    this.updateContext(this.context2, this.background2);
                }
                if (input === this.images1et2.nativeElement) {
                    this.background1 = this.background2 = URL.createObjectURL(file[0]);
                    this.updateContext(this.context1, this.background1);
                    this.updateContext(this.context2, this.background2);
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
    verifyImageContent(): void {
        const img1Src: string = this.image1.nativeElement.value;
        const img2Src: string = this.image2.nativeElement.value;
        const img1HasContent: boolean = img1Src !== '';
        const img2HasContent: boolean = img2Src !== '';

        if (img1HasContent && img2HasContent) {
            // this.differenceService.detectDifferences(img1Src, img2Src, this.radiusSize);
            // this.differenceService.computeLevelDifficulty(8, this.image1.nativeElement);
        }
    }

    reset(): void {
        this.image1.nativeElement.value = null;
        this.image2.nativeElement.value = null;
        this.images1et2.nativeElement.value = null;
        this.context1.clearRect(0, 0, this.canvas1.nativeElement.width, this.canvas2.nativeElement.height);
        this.context2.clearRect(0, 0, this.canvas1.nativeElement.width, this.canvas2.nativeElement.height);
    }
}
