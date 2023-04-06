/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Instruction, InstructionReplay } from '@app/interfaces/video-replay';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { Color } from 'src/assets/variables/color';
import { PossibleColor } from 'src/assets/variables/images-values';
import { Dimensions } from 'src/assets/variables/picture-dimension';
import { ErrorText } from 'src/assets/variables/text';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-replay-play-area',
    templateUrl: './replay-play-area.component.html',
    styleUrls: ['./replay-play-area.component.scss'],
})
export class ReplayPlayAreaComponent implements AfterViewInit, OnChanges, OnInit {
    @Input() image1: string;
    @Input() image2: string;
    @Input() time: number;
    @Input() speed: number;
    @Input() actions: InstructionReplay[];
    @Input() sources: string[];
    @Input() cheatLayers: HTMLCanvasElement[];
    @Input() pauseSignal: boolean = false;
    @Input() continueSignal: boolean = false;
    @Input() restartSignal: boolean = false;
    @Output() hintEvent = new EventEmitter();
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    original = new Image();
    modified = new Image();
    cheatLayer: HTMLCanvasElement;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };
    private pauseCanvas1: HTMLCanvasElement;
    private pauseCanvas2: HTMLCanvasElement;
    private differenceInterval: ReturnType<typeof setInterval>;
    private cheatInterval: ReturnType<typeof setInterval>;
    private errorTimeout: ReturnType<typeof setTimeout>;
    private layerTimeout: ReturnType<typeof setTimeout>;
    // private hintInterval: ReturnType<typeof setInterval>;
    // private hintTimeout: ReturnType<typeof setInterval>;
    private currentAction: InstructionReplay | undefined;
    private audioValid = new Audio('assets/sounds/valid_sound.mp3');
    private audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');
    private counter = 0;
    private srcCounter = 0;
    private firstChange = true;
    private paused = false;

    constructor(private playAreaService: PlayAreaService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngOnInit() {
        this.playAreaService.setComponent(this, true);
        this.currentAction = this.actions[this.counter++];
    }

    ngAfterViewInit(): void {
        this.setContexts();
        this.initializePauseCanvas();
        this.original.src = this.image1;
        this.modified.src = this.image2;
        this.original.onload = () => {
            this.handleImageLoad(this.context1, this.original);
        };
        this.modified.onload = () => {
            this.handleImageLoad(this.context2, this.modified);
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.firstChange) {
            if (changes.continueSignal) this.continue();
            if (changes.restartSignal) this.restart();
            if (changes.pauseSignal) this.pause();
        }
        this.firstChange = false;

        if (!this.currentAction) {
            this.playAreaService.endCheatMode();
            return;
        }
        if (this.currentAction.timeStart <= this.time) {
            this.handleReplay();
            this.currentAction = this.actions[this.counter++];
        }
    }

    private restart() {
        if (this.paused) {
            this.continue();
        }
        this.clearAsync();
        this.audioInvalid.pause();
        this.audioValid.pause();
        this.counter = 0;
        this.srcCounter = 0;
        this.original.src = this.image1;
        this.modified.src = this.image2;
        this.currentAction = this.actions[this.counter++];
    }

    private pause() {
        if (this.paused) return;
        this.paused = true;
        this.changeActiveContext(this.pauseCanvas1, this.canvas1.nativeElement, true);
        this.changeActiveContext(this.pauseCanvas2, this.canvas2.nativeElement, false);
    }

    private continue() {
        if (!this.paused) return;
        this.paused = false;
        this.changeActiveContext(this.canvas1.nativeElement, this.pauseCanvas1, true);
        this.changeActiveContext(this.canvas2.nativeElement, this.pauseCanvas2, false);
    }

    private handleReplay(): void {
        if (!this.currentAction) return;

        switch (this.currentAction.type) {
            case Instruction.DiffFound: {
                if (!this.currentAction.difference) return;
                this.playAudio(this.audioValid);
                this.flashDifference(this.currentAction.difference);
                break;
            }
            case Instruction.Error: {
                const canvas = this.currentAction.leftCanvas ? this.canvas1.nativeElement : this.canvas2.nativeElement;
                this.playAudio(this.audioInvalid);
                this.errorAnswerVisuals(canvas);
                break;
            }
            case Instruction.CheatModeStart: {
                if (!this.currentAction.cheatLayer) return;
                this.cheatLayer = this.currentAction.cheatLayer;
                this.playAreaService.startCheatMode();
                break;
            }
            case Instruction.CheatModeEnd: {
                this.playAreaService.endCheatMode();
                break;
            }
            case Instruction.Hint: {
                this.hintEvent.emit();
                if (!this.currentAction.cheatLayer || !this.currentAction.mousePosition) return;
                this.playAreaService.playHint(this.currentAction.nbDifferences, this.currentAction.cheatLayer, this.currentAction.mousePosition);
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
        const timeOut = Time.Fifty / this.speed;
        const totalDuration = Time.Thousand / 2 / this.speed;
        const layer = this.createAndFillNewLayer(Color.Luigi, false, difference);
        let isFlashing = false;
        clearInterval(this.differenceInterval);
        this.differenceInterval = setInterval(() => {
            if (isFlashing) {
                this.updateContexts();
            } else {
                this.context1.drawImage(layer, 0, 0, this.width, this.height);
                this.context2.drawImage(layer, 0, 0, this.width, this.height);
            }
            isFlashing = !isFlashing;
        }, timeOut);
        this.layerTimeout = setTimeout(() => {
            clearInterval(this.differenceInterval);
            this.cheatLayer = this.cheatLayers[this.srcCounter];
            this.modified.src = this.sources[this.srcCounter++];
            this.updateContexts();
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
        const nMilliseconds = Time.Thousand / this.speed;

        const context = canvas.getContext('2d');
        if (context) {
            context.fillStyle = Color.Mario;
            clearTimeout(this.errorTimeout);
            this.updateContexts();
            context.fillText(
                'ERREUR',
                this.currentAction?.mousePosition.x - ErrorText.Width / 2,
                this.currentAction?.mousePosition.y + ErrorText.Height / 2,
                ErrorText.Width,
            );
            this.errorTimeout = setTimeout(() => {
                this.updateContexts();
            }, nMilliseconds);
        }
    }

    private initializePauseCanvas() {
        this.pauseCanvas1 = document.createElement('canvas');
        this.pauseCanvas1.width = this.width;
        this.pauseCanvas1.height = this.height;
        this.pauseCanvas2 = document.createElement('canvas');
        this.pauseCanvas2.width = this.width;
        this.pauseCanvas2.height = this.height;
    }

    private changeActiveContext(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement, firstContext: boolean) {
        const context = canvas1.getContext('2d');
        if (!context) return;
        context.drawImage(canvas2, 0, 0, this.width, this.height);
        if (firstContext) this.context1 = context;
        else this.context2 = context;
    }

    private clearAsync() {
        clearInterval(this.cheatInterval);
        clearInterval(this.differenceInterval);
        clearTimeout(this.errorTimeout);
        clearTimeout(this.layerTimeout);
    }

    private updateContexts() {
        this.context1.drawImage(this.original, 0, 0, this.width, this.height);
        this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
    }

    private playAudio(audio: HTMLAudioElement) {
        this.audioValid.pause();
        this.audioInvalid.pause();
        audio.currentTime = 0;
        audio.play();
    }
}
