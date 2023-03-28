import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { InstructionReplay } from '@app/interfaces/video-replay';
import { Color } from 'src/assets/variables/color';
import { PossibleColor } from 'src/assets/variables/images-values';
import { Dimensions } from 'src/assets/variables/picture-dimension';

@Component({
    selector: 'app-fake-play-area',
    templateUrl: './fake-play-area.component.html',
    styleUrls: ['./fake-play-area.component.scss'],
})
export class FakePlayAreaComponent implements AfterViewInit, OnChanges, OnInit {
    @Input() original: string;
    @Input() modified: string;
    @Input() time: number;
    @Input() actions: InstructionReplay[];
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };
    private context1: CanvasRenderingContext2D;
    private context2: CanvasRenderingContext2D;
    private image1 = new Image();
    private image2 = new Image();
    private differenceInterval: ReturnType<typeof setInterval>;
    private currentAction: InstructionReplay | undefined;
    private audioValid = new Audio('assets/sounds/valid_sound.mp3');
    // private audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngOnInit() {
        this.currentAction = this.actions.shift();
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

    ngOnChanges(): void {
        if (this.currentAction && this.currentAction.difference) {
            if (this.currentAction.timeStart === this.time) {
                this.playAudio();
                this.flashDifference(this.currentAction.difference);

                if (this.actions.length) {
                    this.currentAction = this.actions.shift();
                }
            }
        }
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

    private flashDifference(difference: number[][]) {
        if (!this.context1 || !this.context2) {
            return;
        }
        const timeOut = 50;
        const totalDuration = 500;
        const layer = this.createAndFillNewLayer(Color.Luigi, false, difference);
        let isFlashing = false;
        this.differenceInterval = setInterval(() => {
            if (isFlashing) {
                this.context1.drawImage(this.image1, 0, 0, this.width, this.height);
                this.context2.drawImage(this.image2, 0, 0, this.width, this.height);
            } else {
                this.context1.drawImage(layer, 0, 0, this.width, this.height);
                this.context2.drawImage(layer, 0, 0, this.width, this.height);
            }
            isFlashing = !isFlashing;
        }, timeOut);
        setTimeout(() => {
            clearInterval(this.differenceInterval);
            this.context1.drawImage(this.image1, 0, 0, this.width, this.height);
            this.context2.drawImage(this.image2, 0, 0, this.width, this.height);
        }, totalDuration);
    }

    private createAndFillNewLayer(color: Color, isCheat: boolean, matrix: number[][]): HTMLCanvasElement {
        const cheatAlphaValue = 0.7;
        const layer = document.createElement('canvas');
        layer.width = this.width;
        layer.height = this.height;
        const context = layer.getContext('2d');
        if (!context) {
            return layer;
        }
        context.globalAlpha = isCheat ? cheatAlphaValue : 1;
        context.fillStyle = color;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] !== PossibleColor.EMPTYPIXEL) {
                    context.fillRect(j, i, 1, 1);
                }
            }
        }
        return layer;
    }

    private playAudio() {
        this.audioValid.pause();
        this.audioValid.currentTime = 0;
        this.audioValid.play();
    }
}
