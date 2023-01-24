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
    constructor() {}
    ngAfterViewInit(): void {
        this.context1 = this.canvas1.nativeElement.getContext('2d');
        if (this.context1) {
            // this.context1.fillStyle = 'red';
            // this.context1.fillRect(0, 0, 5, 5);
        }
        this.context2 = this.canvas2.nativeElement.getContext('2d');
    }
    validateImage(id: string) {
        document.getElementById(id);
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
