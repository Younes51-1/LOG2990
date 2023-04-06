import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameRoom } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { ChatService } from '@app/services/chat/chat.service';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { GameService } from '@app/services/game/game.service';
import { HelpService } from '@app/services/help/help.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { Color } from 'src/assets/variables/color';
import { PossibleColor } from 'src/assets/variables/images-values';
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
    @Output() toggleHint = new EventEmitter();
    @Output() userError = new EventEmitter();
    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    original = new Image();
    modified = new Image();
    layer: HTMLCanvasElement;
    differenceMatrix: number[][];
    private canvasClicked: HTMLCanvasElement;
    private playerIsAllowedToClick = true;
    private mousePosition: Vec2 = { x: 0, y: 0 };
    private buttonPressed = '';
    private audioValid = new Audio('assets/sounds/valid_sound.mp3');
    private audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');
    private currentDifferenceMatrix: number[][];
    private differenceIntervalId: ReturnType<typeof setInterval>;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };

    // eslint-disable-next-line max-params
    constructor(
        private mouseService: MouseService,
        private detectionService: DetectionDifferenceService,
        private gameService: GameService,
        private chatService: ChatService,
        private helpService: HelpService,
    ) {}

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
            this.helpService.isCheatModeOn = !this.helpService.isCheatModeOn;
            this.helpService.cheatMode();
        }
        if (this.buttonPressed === 'i' && !this.gameRoom.userGame.username2) {
            this.toggleHint.emit();
        }
    }

    ngAfterViewInit() {
        this.gameService.serverValidateResponse$.subscribe((difference: DifferenceTry) => {
            if (difference.validated) {
                this.correctRetroaction(difference.differencePos);
            } else if (difference.username === this.gameService.username) {
                this.errorRetroaction(this.canvasClicked);
            }
        });
        this.setContexts();
        this.helpService.setComponent(this);
    }

    ngOnChanges() {
        if (this.gameService.gameRoom && this.gameRoom?.userGame?.gameData) {
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

    async mouseClickAttempt(event: MouseEvent, canvas: HTMLCanvasElement) {
        if (this.playerIsAllowedToClick) {
            this.mousePosition = this.mouseService.mouseClick(event, this.mousePosition);
            const isValidated = this.differenceMatrix[this.mousePosition.y][this.mousePosition.x] !== PossibleColor.EMPTYPIXEL;
            if (isValidated) {
                this.gameService.sendServerValidate(this.mousePosition);
                this.canvasClicked = canvas;
            } else {
                this.errorRetroaction(canvas);
            }
        }
    }

    verifyDifferenceMatrix(option: string, matrix?: number[][]) {
        if (option === 'cheat') {
            this.layer = this.createAndFillNewLayer(Color.Cheat, true, false, this.differenceMatrix);
        } else if (option === 'hint' && matrix) {
            this.layer = this.createAndFillNewLayer(Color.Hint, false, true, matrix);
        }
    }

    // TODO: refactor this function
    // eslint-disable-next-line max-params
    createAndFillNewLayer(color: Color, isCheat: boolean, isHint: boolean, matrix: number[][]): HTMLCanvasElement {
        const helpAlphaValue = 0.5;
        const layer = document.createElement('canvas');
        layer.width = this.width;
        layer.height = this.height;
        const context = layer.getContext('2d');
        if (!context) {
            return layer;
        }
        context.globalAlpha = isCheat || isHint ? helpAlphaValue : 1;
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

    private setContexts() {
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

    private handleImageLoad(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        if (context) {
            context.drawImage(image, 0, 0, this.width, this.height);
        }
    }

    private correctRetroaction(differencePos: Vec2) {
        this.playerIsAllowedToClick = false;
        this.correctAnswerVisuals(differencePos);
        this.audioValid.pause();
        this.audioValid.currentTime = 0;
        this.audioValid.play();
        if (this.gameService.gameMode === 'limited-time-mode') {
            this.gameService.changeTime(this.gameService.gameConstans.bonusTime);
            this.gameService.nextGame();
            this.ngOnChanges();
        }
    }

    private errorRetroaction(canvas: HTMLCanvasElement) {
        this.playerIsAllowedToClick = false;
        this.audioInvalid.play();
        this.errorAnswerVisuals(canvas);
        this.userError.emit();
        if (this.gameService.gameMode === 'limited-time-mode') {
            this.gameService.changeTime(-this.gameService.gameConstans.penaltyTime);
        }
    }

    private errorAnswerVisuals(canvas: HTMLCanvasElement) {
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

    private correctAnswerVisuals(coords: Vec2) {
        if (this.differenceMatrix) {
            this.currentDifferenceMatrix = this.detectionService.extractDifference(JSON.parse(JSON.stringify(this.differenceMatrix)), coords);
            this.flashDifference(this.currentDifferenceMatrix);
        }
    }

    private flashDifference(difference: number[][]) {
        if (!this.context1 || !this.context2) {
            return;
        }
        const timeOut = 100;
        const totalDuration = 1000;
        const layer = this.createAndFillNewLayer(Color.Luigi, false, false, difference);
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

    private removeDifference(differenceMatrix: number[][]) {
        const differencePositions: Vec2[] = [];
        this.context1.drawImage(this.original, 0, 0, this.width, this.height);
        this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
        const image1 = this.context1.getImageData(0, 0, this.width, this.height);
        const image2 = this.context2.getImageData(0, 0, this.width, this.height);

        for (let i = 0; i < differenceMatrix.length; i++) {
            for (let j = 0; j < differenceMatrix[0].length; j++) {
                if (differenceMatrix[i][j] !== PossibleColor.EMPTYPIXEL) {
                    differencePositions.push({ x: j, y: i });
                    this.differenceMatrix[i][j] = PossibleColor.EMPTYPIXEL;
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
        this.context2.clearRect(0, 0, this.width, this.height);
        this.context2.putImageData(image2, 0, 0);
        this.modified.src = this.canvas2.nativeElement.toDataURL();
        this.verifyDifferenceMatrix('cheat');
    }
}
