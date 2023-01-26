import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-creation-game-page',
    templateUrl: './creation-game-page.component.html',
    styleUrls: ['./creation-game-page.component.scss'],
})
export class CreationGamePageComponent implements AfterViewInit {
    @ViewChild('image1', { static: false }) image1: ElementRef;
    @ViewChild('image2', { static: false }) image2: ElementRef;
    @ViewChild('deuxImages', { static: false }) deuxImages: ElementRef;
    @ViewChild('canvas1', { static: false }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) canvas2: ElementRef<HTMLCanvasElement>;
    context1: CanvasRenderingContext2D | null;
    context2: CanvasRenderingContext2D | null;
    width: number;
    height: number;
    background = 'white';

    constructor() {
        this.width = 640;
        this.height = 480;
    }

    ngAfterViewInit(): void {
        this.context1 = this.canvas1.nativeElement.getContext('2d');
        if (this.context1) {
            const background = new Image();
            background.src = 'https://fjolt.com/images/misc/202203281.png';
            background.onload = () => {
                if (this.context1) this.context1.drawImage(background, 0, 0, this.width, this.height);
            };
        }
        this.context2 = this.canvas2.nativeElement.getContext('2d');
    }
    updateImageDisplay() {
        //
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
        this.deuxImages.nativeElement.value = null;
        if (this.context1) {
            this.context1.clearRect(0, 0, this.canvas1.nativeElement.width, this.canvas2.nativeElement.height);
        }
        if (this.context2) {
            this.context2.clearRect(0, 0, this.canvas1.nativeElement.width, this.canvas2.nativeElement.height);
        }
    }
}
