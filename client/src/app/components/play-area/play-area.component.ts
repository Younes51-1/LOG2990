import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseService } from '@app/services/mouse.service';
import { DifferencesFoundService } from '@app/services/differencesFound/differences-found.service';
import { DetectionDifferenceService } from '@app/services/detection-difference.service';
import { CommunicationService } from '@app/services/communication.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 480;

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
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
    radius: number = 3;
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
            this.context1.fillStyle = 'red';
            this.context1.font = '30px comic sans ms';
        }
        const context2 = this.canvas2.nativeElement.getContext('2d');
        if (context2) {
            this.context2 = context2;
            this.context2.fillStyle = 'red';
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
            switch (isValidated) {
                case true: {
                    this.handleDifferenceCount();
                    this.correctAnswerVisuals(this.mousePosition.x, this.mousePosition.y);
                    this.audioValid.pause();
                    this.audioValid.currentTime = 0;
                    this.audioValid.play();
                    // this.removeDifference(canvas);
                    // appel fonctions Tentative validee
                    break;
                }
                default: {
                    this.playerIsAllowedToClick = false;
                    this.audioInvalid.play();
                    this.visualRetroaction(canvas);
                }
            }
        }
    }

    visualRetroaction(canvas: HTMLCanvasElement) {
        const textDimensions = { x: 50, y: 30 };
        const nMilliseconds = 1000;

        if (canvas === this.canvas1.nativeElement) {
            this.context1.fillStyle = 'red';
            this.context1.fillText(
                'ERREUR',
                this.mousePosition.x - textDimensions.x / 2,
                this.mousePosition.y + textDimensions.y / 2,
                textDimensions.x,
            );
            setTimeout(() => {
                this.context1.drawImage(this.original, 0, 0, this.width, this.height);
                this.playerIsAllowedToClick = true;
            }, nMilliseconds);
        } else if (canvas === this.canvas2.nativeElement) {
            this.context2.fillStyle = 'red';
            this.context2.fillText(
                'ERREUR',
                this.mousePosition.x - textDimensions.x / 2,
                this.mousePosition.y + textDimensions.y / 2,
                textDimensions.x,
            );
            setTimeout(() => {
                this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
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
        const timeOut = 800;
        const layer1 = document.createElement('canvas');
        const layer2 = document.createElement('canvas');
        layer1.width = this.width;
        layer1.height = this.height;
        layer2.width = this.width;
        layer2.height = this.height;
        const layerContext1 = layer1.getContext('2d');
        const layerContext2 = layer2.getContext('2d');
        if (this.context1 && layerContext1 && this.context2 && layerContext2) {
            layerContext1.fillStyle = 'red';
            layerContext2.fillStyle = 'red';
            for (let i = 0; i < difference.length; i++) {
                for (let j = 0; j < difference[i].length; j++) {
                    if (difference[i][j] === 1) {
                        layerContext1.fillRect(j, i, 1, 1);
                        layerContext2.fillRect(j, i, 1, 1);
                    }
                }
            }
            layerContext1.drawImage(layer1, 0, 0, this.width, this.height);
            layerContext2.drawImage(layer2, 0, 0, this.width, this.height);

            this.context1.drawImage(layer1, 0, 0, this.width, this.height);
            this.context2.drawImage(layer2, 0, 0, this.width, this.height);

            setTimeout(() => {
                this.context1.clearRect(0, 0, this.width, this.height);
                this.context1.drawImage(this.original, 0, 0, this.width, this.height);
                this.context2.clearRect(0, 0, this.width, this.height);
                this.context2.drawImage(this.modified, 0, 0, this.width, this.height);
            }, timeOut);
        }
    }

    removeDifference(canvas: HTMLCanvasElement) {
        const newLayer = document.createElement('canvas');
        newLayer.width = this.width;
        newLayer.height = this.height;
        const layerContext = newLayer.getContext('2d');
        if (this.context1 && this.context2 && layerContext) {
            if (canvas === this.canvas1.nativeElement) {
                for (let i = 0; i < this.currentDifferenceMatrix.length; i++) {
                    for (let j = 0; j < this.currentDifferenceMatrix[0].length; j++) {
                        if (this.currentDifferenceMatrix[i][j] === 1) {
                            const imageData = this.context2.getImageData(i, j, 1, 1);
                            const fillStyle = 'rgb(' + imageData.data[0] + ',' + imageData.data[1] + ', ' + imageData.data[2] + ')';
                            layerContext.fillStyle = fillStyle;
                            layerContext.fillRect(j, i, 1, 1);
                        }
                    }
                }
                layerContext.drawImage(newLayer, 0, 0, this.width, this.height);
                this.context1.drawImage(newLayer, 0, 0, this.width, this.height);
            } else if (canvas === this.canvas2.nativeElement) {
                for (let i = 0; i < this.currentDifferenceMatrix.length; i++) {
                    for (let j = 0; j < this.currentDifferenceMatrix[0].length; j++) {
                        if (this.currentDifferenceMatrix[i][j] === 1) {
                            const imageData = this.context1.getImageData(i, j, 1, 1);
                            const fillStyle = 'rgb(' + imageData.data[0] + ',' + imageData.data[1] + ', ' + imageData.data[2] + ')';
                            layerContext.fillStyle = fillStyle;
                            layerContext.fillRect(j, i, 1, 1);
                        }
                    }
                }
                layerContext.drawImage(newLayer, 0, 0, this.width, this.height);
                this.context2.drawImage(newLayer, 0, 0, this.width, this.height);
            }
        }
    }
}
