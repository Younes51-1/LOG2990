import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { Instruction, InstructionReplay } from '@app/interfaces/video-replay';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { Dimensions } from 'src/assets/variables/picture-dimension';

@Component({
    selector: 'app-replay-play-area',
    templateUrl: './replay-play-area.component.html',
    styleUrls: ['./replay-play-area.component.scss'],
})
export class ReplayPlayAreaComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {
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
    srcCounter = 0;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };
    private pauseCanvas1: HTMLCanvasElement;
    private pauseCanvas2: HTMLCanvasElement;
    private currentAction: InstructionReplay | undefined;
    private audioValid = new Audio('assets/sounds/valid_sound.mp3');
    private audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');
    private counter = 0;
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
        this.playAreaService.setContexts();
        this.initializePauseCanvas();
        this.original.src = this.image1;
        this.modified.src = this.image2;
        this.original.onload = () => {
            this.playAreaService.handleImageLoad(this.context1, this.original);
        };
        this.modified.onload = () => {
            this.playAreaService.handleImageLoad(this.context2, this.modified);
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.playAreaService.setSpeed(this.speed);
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
        this.playAreaService.updateCheatSpeed();
    }

    ngOnDestroy(): void {
        this.playAreaService.endCheatMode();
    }

    private restart() {
        if (this.paused) {
            this.continue();
        }
        this.playAreaService.clearAsync();
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
                this.playAreaService.flashDifference(this.currentAction.difference);
                break;
            }
            case Instruction.Error: {
                if (!this.currentAction.mousePosition) return;
                const canvas = this.currentAction.leftCanvas ? this.canvas1.nativeElement : this.canvas2.nativeElement;
                this.playAudio(this.audioInvalid);
                this.playAreaService.errorAnswerVisuals(canvas, this.currentAction.mousePosition);
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
                break;
            }
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

    private playAudio(audio: HTMLAudioElement) {
        this.audioValid.pause();
        this.audioInvalid.pause();
        audio.currentTime = 0;
        audio.playbackRate = this.speed;
        audio.play();
    }
}
