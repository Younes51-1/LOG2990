import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communication.service';
import { DetectionDifferenceService } from '@app/services/detection-difference.service';
import { DifferencesFoundService } from '@app/services/differencesFound/differences-found.service';
import { MouseService } from '@app/services/mouse.service';

export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 480;

enum Color {
    Luigi = '#08A936',
    Mario = '#E0120F',
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('canvas1', { static: false }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) canvas2: ElementRef<HTMLCanvasElement>;

    @Input() gameName: string;

    playerIsAllowedToClick = true;
    context1: CanvasRenderingContext2D;
    context1text: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    original = new Image();
    modified = new Image();
    audioValid = new Audio('https://dl.dropboxusercontent.com/s/dxe6u6194129egw/valid_sound.mp3');
    audioInvalid = new Audio('https://dl.dropboxusercontent.com/s/8eh3p45prkuvw8b/invalid_sound.mp3');
    differenceMatrix: number[][];
    currentDifferenceMatrix: number[][];
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(
        private mouseService: MouseService,
        private differencesFoundService: DifferencesFoundService,
        private detectionService: DetectionDifferenceService,
        private communicationService: CommunicationService,
    ) {}

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

    ngAfterViewInit(): void {
        this.communicationService.getGame(this.gameName).subscribe((res) => {
            if (res.differenceMatrix) {
                this.differenceMatrix = res.differenceMatrix;
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
        this.communicationService.getGame(this.gameName).subscribe((res) => {
            if (res.gameForm) {
                this.original.src = res.gameForm.image1url;
                this.modified.src = res.gameForm.image2url;
            }
        });
        this.original.crossOrigin = 'Anonymous';
        this.modified.crossOrigin = 'Anonymous';
        this.original.onload = () => {
            if (context1 != null) {
                context1.drawImage(this.original, 0, 0, this.width, this.height);
            }
        };
        this.modified.onload = () => {
            if (context2 != null) {
                context2.drawImage(this.modified, 0, 0, this.width, this.height);
            }
        };
    }

    mouseClickAttempt(event: MouseEvent, canvas: HTMLCanvasElement) {
        if (this.playerIsAllowedToClick) {
            this.mousePosition = this.mouseService.mouseClick(event, this.mousePosition);
            // isValidated doit utiliser doit prendre la validation de la tentative du serveur dynamique
            const isValidated = this.differenceMatrix[this.mousePosition.y][this.mousePosition.x] === 0;
            if (isValidated) {
                this.playerIsAllowedToClick = false;
                this.handleDifferenceCount();
                this.correctAnswerVisuals(this.mousePosition.x, this.mousePosition.y);
                this.audioValid.pause();
                this.audioValid.currentTime = 0;
                this.audioValid.play();
                // appel fonctions Tentative validee
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

    handleDifferenceCount() {
        const count = this.differencesFoundService.getDifferencesFound();
        this.differencesFoundService.updateDifferencesFound(count + 1);
    }

    correctAnswerVisuals(xCoord: number, yCoord: number) {
        this.currentDifferenceMatrix = this.detectionService.extractDifference(this.differenceMatrix, xCoord, yCoord);
        this.flashDifference(this.currentDifferenceMatrix);
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
                for (let j = 0; j < difference[i].length; j++) {
                    if (difference[i][j] === 1) {
                        layerContext1.fillRect(j, i, 1, 1);
                        layerContext2.fillRect(j, i, 1, 1);
                    }
                }
            }
            for (let i = 1; i <= 5; i++) {
                setTimeout(() => {
                    this.context1.drawImage(layer1, 0, 0, this.width, this.height);
                    this.context2.drawImage(layer2, 0, 0, this.width, this.height);
                    setTimeout(() => {
                        this.context1.drawImage(this.original, 0, 0, this.width, this.height);
                        this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
                        if (i === 1) this.removeDifference(this.currentDifferenceMatrix);
                        if (i === 5) this.playerIsAllowedToClick = true;
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
                if (differenceMatrix[i][j] === 1) {
                    differencePositions.push({ x: i, y: j });
                    this.differenceMatrix[i][j] = -1;
                }
            }
        }

        // eslint-disable-next-line guard-for-in
        for (const i in differencePositions) {
            const x = differencePositions[i].x;
            const y = differencePositions[i].y;
            const index = (x * this.width + y) * 4;

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
