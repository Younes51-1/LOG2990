import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseService } from '@app/services/mouse.service';
import { DifferencesFoundService } from '@app/services/differencesFound/differences-found.service';

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
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(private mouseService: MouseService, private differencesFoundService: DifferencesFoundService) {}

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
        this.original.src = '../../../assets/card.png';
        this.modified.src = '../../../assets/card.png';
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
            const isValidated = this.mousePosition.x <= 200;
            switch (isValidated) {
                case true: {
                    this.handleDifferenceCount();
                    this.correctAnswerVisuals(canvas);
                    this.audioValid.pause();
                    this.audioValid.currentTime = 0;
                    this.audioValid.play();
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

    correctAnswerVisuals(canvas: HTMLCanvasElement) {
        const timeOut = 500;
        const context1 = canvas.getContext('2d');
        const layer = document.createElement('canvas');
        layer.width = this.width;
        layer.height = this.height;
        const layerContext = layer.getContext('2d');
        if (context1 && layerContext) {
            layerContext.fillStyle = 'red';
            layerContext.fillRect(this.mousePosition.x, this.mousePosition.y, 20, 20);

            context1.drawImage(layer, 0, 0, this.width, this.height);

            setTimeout(() => {
                context1.clearRect(0, 0, this.width, this.height);
                context1.drawImage(this.original, 0, 0, this.width, this.height);
            }, timeOut);
        }
    }
}
