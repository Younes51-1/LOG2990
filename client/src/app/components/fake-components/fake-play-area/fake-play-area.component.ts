import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Instruction, InstructionReplay } from '@app/interfaces/video-replay';
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
    @Input() speed: number;
    @Input() actions: InstructionReplay[];
    @Input() sources: string[];
    @Input() cheatLayers: HTMLCanvasElement[];
    @Input() replayRestarted: boolean;
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };
    private context1: CanvasRenderingContext2D;
    private context2: CanvasRenderingContext2D;
    private image1 = new Image();
    private image2 = new Image();
    private differenceInterval: ReturnType<typeof setInterval>;
    private cheatInterval: ReturnType<typeof setInterval>;
    private currentAction: InstructionReplay | undefined;
    private audioValid = new Audio('assets/sounds/valid_sound.mp3');
    private audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');
    private counter = 0;
    private srcCounter = 0;
    private cheatLayer: HTMLCanvasElement;

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngOnInit() {
        this.currentAction = this.actions[this.counter++];
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
        if (!this.currentAction) return;

        if (this.currentAction.timeStart <= this.time) {
            this.handleReplay();

            if (this.actions.length) {
                this.currentAction = this.actions[this.counter++];
            } else {
                this.currentAction = undefined;
            }
        }
    }

    private handleReplay(): void {
        if (!this.currentAction) return;

        switch (this.currentAction.type) {
            case Instruction.DiffFound: {
                if (!this.currentAction.difference) return;
                this.playValidAudio();
                this.flashDifference(this.currentAction.difference);
                break;
            }
            case Instruction.Error: {
                const canvas = this.currentAction.leftCanvas ? this.canvas1.nativeElement : this.canvas2.nativeElement;
                this.playInvalidAudio();
                this.errorAnswerVisuals(canvas);
                break;
            }
            case Instruction.CheatModeStart: {
                if (!this.currentAction.cheatLayer) return;
                this.cheatLayer = this.currentAction.cheatLayer;
                // this.cheatModeOn = true;
                this.startCheatMode();
                break;
            }
            case Instruction.CheatModeEnd: {
                // this.cheatModeOn = false;
                this.endCheatMode();
                break;
            }
            // No default
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
        const timeOut = 50 / this.speed;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const totalDuration = 500 / this.speed;
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
            this.cheatLayer = this.cheatLayers[this.srcCounter];
            this.image2.src = this.sources[this.srcCounter++];
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

    private errorAnswerVisuals(canvas: HTMLCanvasElement) {
        if (!this.currentAction?.mousePosition) {
            return;
        }
        const textDimensions = { x: 50, y: 30 };
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const nMilliseconds = 1000 / this.speed;

        const context = canvas.getContext('2d');
        const image = canvas === this.canvas1.nativeElement ? this.image1 : this.image2;
        if (context) {
            context.fillStyle = Color.Mario;
            context.fillText(
                'ERREUR',
                this.currentAction?.mousePosition.x - textDimensions.x / 2,
                this.currentAction?.mousePosition.y + textDimensions.y / 2,
                textDimensions.x,
            );
            setTimeout(() => {
                context.drawImage(image, 0, 0, this.width, this.height);
            }, nMilliseconds);
        }
    }

    private startCheatMode() {
        const flashDuration = 125 / this.speed;
        let isFlashing = true;
        this.cheatInterval = setInterval(() => {
            if (isFlashing) {
                this.context1.drawImage(this.image1, 0, 0, this.width, this.height);
                this.context2.drawImage(this.image2, 0, 0, this.width, this.height);
            } else {
                this.context1.drawImage(this.cheatLayer, 0, 0, this.width, this.height);
                this.context2.drawImage(this.cheatLayer, 0, 0, this.width, this.height);
            }
            isFlashing = !isFlashing;
        }, flashDuration);
    }

    private endCheatMode() {
        clearInterval(this.cheatInterval);
        this.context1.drawImage(this.image1, 0, 0, this.width, this.height);
        this.context2.drawImage(this.image2, 0, 0, this.width, this.height);
    }

    private playValidAudio() {
        this.audioValid.pause();
        this.audioValid.currentTime = 0;
        this.audioValid.play();
    }

    private playInvalidAudio() {
        this.audioInvalid.pause();
        this.audioValid.currentTime = 0;
        this.audioInvalid.play();
    }
}
