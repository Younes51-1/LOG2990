import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { ChatService } from '@app/services/chat/chat.service';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { Color } from 'src/assets/variables/color';
import { Dimensions } from 'src/assets/variables/picture-dimension';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @ViewChild('canvas1', { static: false }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) canvas2: ElementRef<HTMLCanvasElement>;

    @Input() gameRoom: GameRoom;
    @Output() userError = new EventEmitter();

    canvasClicked: HTMLCanvasElement;
    playerIsAllowedToClick = true;
    context1: CanvasRenderingContext2D;
    context1text: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    mousePosition: Vec2 = { x: 0, y: 0 };
    totalDifferencesFound = 0;
    userDifferencesFound = 0;
    buttonPressed = '';
    original = new Image();
    modified = new Image();
    audioValid = new Audio('assets/sounds/valid_sound.mp3');
    audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');
    differenceMatrix: number[][];
    currentDifferenceMatrix: number[][];
    emptyPixel: number;
    timesFlashDifferences: number;
    isCheatModeOn = false;
    layer: HTMLCanvasElement;
    differenceIntervalId: ReturnType<typeof setInterval>;
    cheatIntervalId: ReturnType<typeof setInterval>;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };

    // eslint-disable-next-line max-params
    constructor(
        private mouseService: MouseService,
        private detectionService: DetectionDifferenceService,
        public classicModeService: ClassicModeService,
        private chatService: ChatService,
    ) {
        this.emptyPixel = -1;
        this.timesFlashDifferences = 5;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('document:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.chatService.getIsTyping()) {
            return;
        }
        this.buttonPressed = event.key;
        if (this.buttonPressed === 't') {
            this.isCheatModeOn = !this.isCheatModeOn;
            this.cheatMode();
        }
    }
    ngAfterViewInit() {
        this.classicModeService.totalDifferencesFound$.subscribe((differencesFound) => {
            this.totalDifferencesFound = differencesFound;
        });

        this.classicModeService.userDifferencesFound$.subscribe((differencesFound) => {
            this.userDifferencesFound = differencesFound;
        });

        this.classicModeService.serverValidateResponse$.subscribe((difference) => {
            if (difference.validated) {
                this.correctRetroaction(difference.differencePos);
            } else if (difference.username === this.classicModeService.username) {
                this.errorRetroaction(this.canvasClicked);
            }
        });

        this.setContexts();
    }

    setContexts() {
        const context1 = this.canvas1.nativeElement.getContext('2d');
        if (context1) {
            this.context1 = context1;
            this.context1.font = '30px comic sans ms';
        }
        const context2 = this.canvas2.nativeElement.getContext('2d');
        if (context2) {
            this.context2 = context2;
            this.context2.font = '30px comic sans ms';
        }
    }

    ngOnChanges() {
        if (this.classicModeService.gameRoom && this.gameRoom?.userGame?.gameData) {
            this.differenceMatrix = this.gameRoom.userGame.gameData.differenceMatrix;
            this.original.src = this.gameRoom.userGame.gameData.gameForm.image1url;
            this.modified.src = this.gameRoom.userGame.gameData.gameForm.image2url;
        }

        this.original.crossOrigin = 'Anonymous'; // needed to get access to images of server
        this.modified.crossOrigin = 'Anonymous';

        this.original.onload = () => {
            this.handleImageLoad(this.context1, this.original);
        };

        this.modified.onload = () => {
            this.handleImageLoad(this.context2, this.modified);
        };
    }

    handleImageLoad(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        if (context) {
            context.drawImage(image, 0, 0, this.width, this.height);
        }
    }

    async mouseClickAttempt(event: MouseEvent, canvas: HTMLCanvasElement) {
        if (this.playerIsAllowedToClick) {
            this.mousePosition = this.mouseService.mouseClick(event, this.mousePosition);
            const isValidated = this.differenceMatrix[this.mousePosition.y][this.mousePosition.x] !== this.emptyPixel;
            if (isValidated) {
                this.classicModeService.validateDifference(this.mousePosition);
                this.canvasClicked = canvas;
            } else {
                this.errorRetroaction(canvas);
            }
        }
    }

    correctRetroaction(differencePos: Vec2) {
        this.playerIsAllowedToClick = false;
        this.correctAnswerVisuals(differencePos);
        this.audioValid.pause();
        this.audioValid.currentTime = 0;
        this.audioValid.play();
    }

    errorRetroaction(canvas: HTMLCanvasElement) {
        this.playerIsAllowedToClick = false;
        this.audioInvalid.play();
        this.visualRetroaction(canvas);
        this.userError.emit();
    }

    visualRetroaction(canvas: HTMLCanvasElement) {
        const textDimensions = { x: 50, y: 30 };
        const nMilliseconds = 1000;

        const context = canvas.getContext('2d');
        const image = canvas === this.canvas1.nativeElement ? this.original : this.modified;
        if (context) {
            context.fillStyle = Color.Mario;
            context.fillText('ERREUR', this.mousePosition.x - textDimensions.x / 2, this.mousePosition.y + textDimensions.y / 2, textDimensions.x);
            setTimeout(() => {
                context.drawImage(image, 0, 0, this.width, this.height);
                this.playerIsAllowedToClick = true;
            }, nMilliseconds);
        }
    }

    correctAnswerVisuals(coords: Vec2) {
        if (this.differenceMatrix) {
            this.currentDifferenceMatrix = this.detectionService.extractDifference(JSON.parse(JSON.stringify(this.differenceMatrix)), coords);
            this.flashDifference(this.currentDifferenceMatrix);
        }
    }

    flashDifference(difference: number[][]) {
        if (!this.context1 || !this.context2) {
            return;
        }
        const timeOut = 100;
        const totalDuration = 1000;
        const layer = this.createAndFillNewLayer(Color.Luigi, false, difference);
        let isFlashing = false;
        this.differenceIntervalId = setInterval(() => {
            if (isFlashing) {
                this.context1.drawImage(this.original, 0, 0, this.width, this.height);
                this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
            } else {
                this.context1.drawImage(layer, 0, 0, this.width, this.height);
                this.context2.drawImage(layer, 0, 0, this.width, this.height);
            }
            isFlashing = !isFlashing;
        }, timeOut);
        setTimeout(() => {
            this.removeDifference(this.currentDifferenceMatrix);
            this.playerIsAllowedToClick = true;
            clearInterval(this.differenceIntervalId);
            this.context1.drawImage(this.original, 0, 0, this.width, this.height);
            this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
        }, totalDuration);
    }

    removeDifference(differenceMatrix: number[][]) {
        const differencePositions: Vec2[] = [];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
        canvas.width = this.width;
        canvas.height = this.height;
        context.drawImage(this.original, 0, 0, this.width, this.height);
        const image1 = context.getImageData(0, 0, this.width, this.height);
        context.drawImage(this.modified, 0, 0, this.width, this.height);
        const image2 = context.getImageData(0, 0, this.width, this.height);

        for (let i = 0; i < differenceMatrix.length; i++) {
            for (let j = 0; j < differenceMatrix[0].length; j++) {
                if (differenceMatrix[i][j] !== this.emptyPixel) {
                    differencePositions.push({ x: j, y: i });
                    this.differenceMatrix[i][j] = this.emptyPixel;
                }
            }
        }
        const pixelDataSize = 4;
        for (const i of differencePositions) {
            const x = i.x;
            const y = i.y;
            const index = (y * this.width + x) * pixelDataSize;

            image2.data[index] = image1.data[index];
            image2.data[index + 1] = image1.data[index + 1];
            image2.data[index + 2] = image1.data[index + 2];
            image2.data[index + 3] = image1.data[index + 3];
        }
        context.putImageData(image2, 0, 0);
        this.modified.src = canvas.toDataURL();
        if (this.isCheatModeOn) {
            this.verifyDifferenceMatrix();
        }
    }

    verifyDifferenceMatrix() {
        this.layer = this.createAndFillNewLayer(Color.Cheat, true, this.differenceMatrix);
    }

    cheatMode() {
        if (!this.context1 || !this.context2) {
            return;
        }
        if (!this.isCheatModeOn) {
            clearInterval(this.cheatIntervalId);
            this.context1.drawImage(this.original, 0, 0, this.width, this.height);
            this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
            return;
        }
        const flashDuration = 125;
        let isFlashing = true;
        this.verifyDifferenceMatrix();
        this.cheatIntervalId = setInterval(() => {
            if (isFlashing) {
                this.context1.drawImage(this.original, 0, 0, this.width, this.height);
                this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
            } else {
                this.context1.drawImage(this.layer, 0, 0, this.width, this.height);
                this.context2.drawImage(this.layer, 0, 0, this.width, this.height);
            }
            isFlashing = !isFlashing;
        }, flashDuration);
    }

    createAndFillNewLayer(color: Color, isCheat: boolean, matrix: number[][]): HTMLCanvasElement {
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
                if (matrix[i][j] !== this.emptyPixel) {
                    context.fillRect(j, i, 1, 1);
                }
            }
        }
        return layer;
    }
}
