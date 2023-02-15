import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, ViewChild } from '@angular/core';
import { UserGame } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
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

    @Input() userGame: UserGame;

    canvasClicked: HTMLCanvasElement;
    playerIsAllowedToClick = true;
    context1: CanvasRenderingContext2D;
    context1text: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    mousePosition: Vec2 = { x: 0, y: 0 };
    differencesFound = 0;
    buttonPressed = '';
    original = new Image();
    modified = new Image();
    audioValid = new Audio('../assets/sounds/valid_sound.mp3');
    audioInvalid = new Audio('../assets/sounds/invalid_sound.mp3');
    differenceMatrix: number[][];
    currentDifferenceMatrix: number[][];
    emptypixel: number;
    timesFlashDifferences: number;
    private canvasSize = { x: Dimensions.DEFAULT_WIDTH, y: Dimensions.DEFAULT_HEIGHT };

    constructor(
        private mouseService: MouseService,
        private detectionService: DetectionDifferenceService,
        public classicModeService: ClassicModeService,
    ) {
        this.emptypixel = -1;
        this.timesFlashDifferences = 5;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }
    ngAfterViewInit() {
        this.classicModeService.differencesFound$.subscribe((differencesFound) => {
            this.differencesFound = differencesFound;
        });
        this.classicModeService.serverValidateResponse$.subscribe((response) => {
            if (response) {
                this.playerIsAllowedToClick = false;
                this.correctAnswerVisuals(this.mousePosition.x, this.mousePosition.y);
                this.audioValid.pause();
                this.audioValid.currentTime = 0;
                this.audioValid.play();
            } else {
                this.playerIsAllowedToClick = false;
                this.audioInvalid.play();
                this.visualRetroaction(this.canvasClicked);
            }
        });
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

    async ngOnChanges() {
        if (this.classicModeService.gameRoom && this.userGame?.gameData) {
            this.differenceMatrix = this.userGame.gameData.differenceMatrix;
            this.original.src = this.userGame.gameData.gameForm.image1url;
            this.modified.src = this.userGame.gameData.gameForm.image2url;
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
        if (context != null) {
            context.drawImage(image, 0, 0, this.width, this.height);
        }
    }

    async mouseClickAttempt(event: MouseEvent, canvas: HTMLCanvasElement) {
        if (this.playerIsAllowedToClick) {
            this.mousePosition = this.mouseService.mouseClick(event, this.mousePosition);
            const isValidated = this.differenceMatrix[this.mousePosition.y][this.mousePosition.x] !== this.emptypixel;
            if (isValidated) {
                this.classicModeService.validateDifference(this.mousePosition);
                this.canvasClicked = canvas;
            } else {
                this.playerIsAllowedToClick = false;
                this.audioInvalid.play();
                this.visualRetroaction(canvas);
            }
        }
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

    correctAnswerVisuals(xCoord: number, yCoord: number) {
        if (this.differenceMatrix) {
            this.currentDifferenceMatrix = this.detectionService.extractDifference(JSON.parse(JSON.stringify(this.differenceMatrix)), xCoord, yCoord);
            this.flashDifference(this.currentDifferenceMatrix);
        }
    }

    flashDifference(difference: number[][]) {
        const timeOut = 100;
        const layer1 = document.createElement('canvas');
        const layer2 = document.createElement('canvas');
        layer1.width = this.width;
        layer1.height = this.height;
        layer2.width = this.width;
        layer2.height = this.height;
        const layerContext1 = layer1.getContext('2d');
        const layerContext2 = layer2.getContext('2d');
        if (this.context1 && layerContext1 && this.context2 && layerContext2) {
            layerContext1.fillStyle = Color.Luigi;
            layerContext2.fillStyle = Color.Luigi;
            for (let i = 0; i < difference.length; i++) {
                for (let j = 0; j < difference[0].length; j++) {
                    if (difference[i][j] !== this.emptypixel) {
                        layerContext1.fillRect(j, i, 1, 1);
                        layerContext2.fillRect(j, i, 1, 1);
                    }
                }
            }
            for (let i = 1; i <= this.timesFlashDifferences; i++) {
                setTimeout(() => {
                    this.context1.drawImage(layer1, 0, 0, this.width, this.height);
                    this.context2.drawImage(layer2, 0, 0, this.width, this.height);
                    setTimeout(() => {
                        this.context1.drawImage(this.original, 0, 0, this.width, this.height);
                        this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
                        if (i === 1) this.removeDifference(this.currentDifferenceMatrix);
                        if (i === this.timesFlashDifferences) this.playerIsAllowedToClick = true;
                    }, timeOut);
                }, 2 * i * timeOut);
            }
        }
    }

    removeDifference(differenceMatrix: number[][]) {
        const differencePositions: Vec2[] = [];
        const image1 = this.context1.getImageData(0, 0, this.width, this.height);
        const image2 = this.context2.getImageData(0, 0, this.width, this.height);

        for (let i = 0; i < differenceMatrix.length; i++) {
            for (let j = 0; j < differenceMatrix[0].length; j++) {
                if (differenceMatrix[i][j] !== this.emptypixel) {
                    differencePositions.push({ x: j, y: i });
                    this.differenceMatrix[i][j] = this.emptypixel;
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
    }
}
