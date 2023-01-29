import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;

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
    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

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
        if (context1) this.context1 = context1;
        const context2 = this.canvas2.nativeElement.getContext('2d');
        if (context2) this.context2 = context2;
        const original = new Image();
        const modified = new Image();
        original.src = '../../../assets/card.png';
        modified.src = '../../../assets/logo.jpg';
        original.onload = () => {
            if (context1 != null) {
                context1.drawImage(original, 0, 0, this.width, this.height);
            }
        };
        modified.onload = () => {
            if (context2 != null) {
                context2.drawImage(modified, 0, 0, this.width, this.height);
            }
        };
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
    }
}
