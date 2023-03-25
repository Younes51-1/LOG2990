import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Dimensions } from 'src/assets/variables/picture-dimension';

@Component({
    selector: 'app-fake-play-area',
    templateUrl: './fake-play-area.component.html',
    styleUrls: ['./fake-play-area.component.scss'],
})
export class FakePlayAreaComponent implements AfterViewInit {
    @Input() original: string;
    @Input() modified: string;
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };
    private context1: CanvasRenderingContext2D;
    private context2: CanvasRenderingContext2D;
    private image1 = new Image();
    private image2 = new Image();
    // private audioValid = new Audio('assets/sounds/valid_sound.mp3');
    // private audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngAfterViewInit(): void {
        this.setContexts();

        this.image1.src = this.original;
        this.image2.src = this.modified;

        this.image1.onload = () => {
            this.handleImageLoad(this.context1, this.image1);
        };

        this.image2.onload = () => {
            this.handleImageLoad(this.context2, this.image2);
        };
    }

    private handleImageLoad(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        if (context) {
            context.drawImage(image, 0, 0, this.width, this.height);
        }
    }

    private setContexts() {
        const context1 = this.canvas1.nativeElement.getContext('2d');
        if (context1) {
            this.context1 = context1;
            this.context1.font = '50px MarioFont';
        }
        const context2 = this.canvas2.nativeElement.getContext('2d');
        if (context2) {
            this.context2 = context2;
            this.context2.font = '50px MarioFont';
        }
    }
}
