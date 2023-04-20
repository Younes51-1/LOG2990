import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ReplayPlayAreaComponent } from '@app/components/replay-play-area/replay-play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { Color } from 'src/assets/variables/color';
import { PIXEL_SIZE, PossibleColor } from 'src/assets/variables/images-values';
import { ErrorText } from 'src/assets/variables/text';
import { Time } from 'src/assets/variables/time';
import { ConfettiService } from '@app/services/confetti/confetti.service';

@Injectable({
    providedIn: 'root',
})
export class PlayAreaService {
    isCheatModeOn = false;
    isHintModeOn = false;
    hintInterval: ReturnType<typeof setInterval>;
    hintTimeout: ReturnType<typeof setTimeout>;
    component: PlayAreaComponent | ReplayPlayAreaComponent;
    speed = 1;

    private cheatInterval: ReturnType<typeof setInterval>;
    private layerTimeout: ReturnType<typeof setTimeout>;
    private differenceInterval: ReturnType<typeof setInterval>;
    private errorTimeout: ReturnType<typeof setTimeout>;

    private replayComponent: ReplayPlayAreaComponent;
    private normalComponent: PlayAreaComponent;
    private replay: boolean;
    private replayCheatOn: boolean;

    constructor(private detectionDifferenceService: DetectionDifferenceService, private confettiService: ConfettiService) {}

    setComponent(component: PlayAreaComponent | ReplayPlayAreaComponent, replay: boolean) {
        this.component = component;
        this.replay = replay;
        if (replay) this.replayComponent = component as ReplayPlayAreaComponent;
        else this.normalComponent = component as PlayAreaComponent;
        this.confettiService.setService(this);
    }

    setCheatMode() {
        this.isCheatModeOn = false;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    clearAsync() {
        clearInterval(this.confettiService.intervalId);
        clearInterval(this.confettiService.confettiInterval);
        clearInterval(this.cheatInterval);
        clearTimeout(this.layerTimeout);
        clearInterval(this.differenceInterval);
        clearTimeout(this.errorTimeout);
        clearInterval(this.hintInterval);
        clearTimeout(this.hintTimeout);
    }

    startConfetti(coords: Vec2 | undefined) {
        this.confettiService.startConfetti(coords);
    }

    cheatMode() {
        if (!this.component.context1 || !this.component.context2) {
            return;
        }
        if (!this.isCheatModeOn) {
            if (!this.replay) this.normalComponent.sendCheatEnd.emit();
            this.endCheatMode();
            return;
        }
        this.startCheatMode();
    }

    hintMode(hintNum: number) {
        if (this.replay) return;
        const diffCoords = this.detectionDifferenceService.findRandomDifference(JSON.parse(JSON.stringify(this.normalComponent.differenceMatrix)));
        if (diffCoords) {
            if (hintNum === 2) {
                this.startConfetti(diffCoords);
                this.normalComponent.sendHint.emit({ hintNum, diffPos: diffCoords, layer: this.normalComponent.hintLayer });
                return;
            } else {
                this.normalComponent.verifyDifferenceMatrix('hint', this.chooseDial(diffCoords, hintNum));
            }
            this.normalComponent.sendHint.emit({ hintNum, diffPos: diffCoords, layer: this.normalComponent.hintLayer });
        }
        this.playNormalHint(this.normalComponent.hintLayer);
    }

    playHint(hintNum: number | undefined, layer: HTMLCanvasElement, pos: Vec2) {
        if (hintNum === 2) {
            this.startConfetti(pos);
        } else {
            this.playNormalHint(layer);
        }
    }

    endCheatMode() {
        if (this.replay) this.replayCheatOn = false;
        clearInterval(this.cheatInterval);
        this.updateContexts();
    }

    startCheatMode() {
        if (this.replay) this.replayCheatOn = true;
        else {
            this.normalComponent.verifyDifferenceMatrix('cheat');
            this.normalComponent.sendCheatStart.emit({ layer: this.component.cheatLayer });
        }
        const flashDuration = Time.OneHundredTwentyFive / this.speed;
        let isFlashing = true;
        this.cheatInterval = setInterval(() => {
            if (isFlashing) {
                this.updateContexts();
            } else {
                this.component.context1.drawImage(this.component.cheatLayer, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.cheatLayer, 0, 0, this.component.width, this.component.height);
            }
            isFlashing = !isFlashing;
        }, flashDuration);
    }

    setContexts() {
        const context1 = this.component.canvas1.nativeElement.getContext('2d');
        if (context1) {
            this.component.context1 = context1;
            this.component.context1.font = '50px MarioFont';
        }
        const context2 = this.component.canvas2.nativeElement.getContext('2d');
        if (context2) {
            this.component.context2 = context2;
            this.component.context2.font = '50px MarioFont';
        }
    }

    flashDifference(difference: number[][]) {
        if (!this.replay) this.normalComponent.sendDiff.emit({ diff: difference });
        if (!this.component.context1 || !this.component.context2) return;
        const layer = this.createAndFillNewLayer(Color.Luigi, false, false, difference);
        let isFlashing = false;
        clearInterval(this.differenceInterval);
        this.differenceInterval = setInterval(() => {
            if (isFlashing) {
                this.updateContexts();
            } else {
                this.component.context1.drawImage(layer, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(layer, 0, 0, this.component.width, this.component.height);
            }
            isFlashing = !isFlashing;
        }, Time.Fifty / this.speed);
        this.layerTimeout = setTimeout(() => {
            if (!this.replay) {
                this.removeDifference(difference);
                this.normalComponent.playerIsAllowedToClick = true;
            }
            clearInterval(this.differenceInterval);
            if (this.replay) {
                this.component.cheatLayer = this.replayComponent.cheatLayers[this.replayComponent.srcCounter];
                this.component.modified.src = this.replayComponent.sources[this.replayComponent.srcCounter++];
            }
            this.updateContexts();
            this.normalComponent.nextGame();
        }, Time.Thousand / 2 / this.speed);
    }

    errorAnswerVisuals(canvas: HTMLCanvasElement, pos: Vec2) {
        const nMilliseconds = Time.Thousand / this.speed;
        const context = canvas.getContext('2d');
        if (!this.replay) {
            const image = canvas === this.component.canvas1.nativeElement ? this.component.original : this.component.modified;
            this.normalComponent.sendError.emit({ pos: this.normalComponent.mousePosition, leftCanvas: image === this.component.original });
        }
        if (context) {
            context.fillStyle = Color.Mario;
            clearTimeout(this.errorTimeout);
            this.updateContexts();
            context.fillText('ERREUR', pos.x - ErrorText.Width / 2, pos.y + ErrorText.Height / 2, ErrorText.Width);
            this.errorTimeout = setTimeout(() => {
                this.updateContexts();
                if (!this.replay) this.normalComponent.playerIsAllowedToClick = true;
            }, nMilliseconds);
        }
    }

    // need all params
    // eslint-disable-next-line max-params
    createAndFillNewLayer(color: Color, isCheat: boolean, isHint: boolean, matrix: number[][]): HTMLCanvasElement {
        const helpAlphaValue = 0.5;
        const layer = document.createElement('canvas');
        layer.width = this.component.width;
        layer.height = this.component.height;
        const context = layer.getContext('2d');
        (context as CanvasRenderingContext2D).globalAlpha = isCheat || isHint ? helpAlphaValue : 1;
        (context as CanvasRenderingContext2D).fillStyle = color;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] !== PossibleColor.EMPTYPIXEL) {
                    (context as CanvasRenderingContext2D).fillRect(j, i, 1, 1);
                }
            }
        }
        return layer;
    }

    handleImageLoad(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        if (context) {
            context.drawImage(image, 0, 0, this.component.width, this.component.height);
        }
    }

    correctAnswerVisuals(pos: Vec2, differenceMatrix: number[][]) {
        if (differenceMatrix) {
            const currentDifferenceMatrix = this.detectionDifferenceService.extractDifference(JSON.parse(JSON.stringify(differenceMatrix)), pos);
            this.flashDifference(currentDifferenceMatrix);
        }
    }

    updateCheatSpeed() {
        if (this.replayCheatOn) {
            this.endCheatMode();
            this.startCheatMode();
        }
    }

    private playNormalHint(layer: HTMLCanvasElement) {
        let isFlashing = true;
        clearTimeout(this.hintTimeout);
        clearInterval(this.hintInterval);
        this.hintInterval = setInterval(() => {
            if (isFlashing) {
                this.updateContexts();
            } else {
                this.component.context1.drawImage(layer, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(layer, 0, 0, this.component.width, this.component.height);
            }
            isFlashing = !isFlashing;
        }, Time.OneHundredTwentyFive);
        this.hintTimeout = setTimeout(() => {
            clearInterval(this.hintInterval);
            this.updateContexts();
        }, (2 * Time.Thousand) / this.speed);
    }

    private removeDifference(differenceMatrix: number[][]) {
        const differencePositions: Vec2[] = [];
        this.updateContexts();
        const image1 = this.component.context1.getImageData(0, 0, this.component.width, this.component.height);
        const image2 = this.component.context2.getImageData(0, 0, this.component.width, this.component.height);

        for (let i = 0; i < differenceMatrix.length; i++) {
            for (let j = 0; j < differenceMatrix[0].length; j++) {
                if (differenceMatrix[i][j] !== PossibleColor.EMPTYPIXEL) {
                    differencePositions.push({ x: j, y: i });
                    this.normalComponent.differenceMatrix[i][j] = PossibleColor.EMPTYPIXEL;
                }
            }
        }
        const pixelDataSize = 4;
        for (const i of differencePositions) {
            const x = i.x;
            const y = i.y;
            const index = (y * this.component.width + x) * pixelDataSize;

            image2.data[index] = image1.data[index];
            image2.data[index + 1] = image1.data[index + 1];
            image2.data[index + 2] = image1.data[index + 2];
            image2.data[index + 3] = image1.data[index + 3];
        }
        this.component.context2.clearRect(0, 0, this.component.width, this.component.height);
        this.component.context2.putImageData(image2, 0, 0);
        this.component.modified.src = this.component.canvas2.nativeElement.toDataURL();
        this.normalComponent.sendSource.emit({ src: this.component.modified.src, layer: this.component.cheatLayer });
        this.normalComponent.verifyDifferenceMatrix('cheat');
    }

    private chooseDial(coords: Vec2, hintNum: number): number[][] {
        if (hintNum !== 0 && hintNum !== 1) return [];
        const dialDimensions = [
            { width: 320, height: 240 },
            { width: 160, height: 120 },
        ];
        const { width: dialWidth, height: dialHeight } = dialDimensions[hintNum];
        switch (hintNum) {
            case 0: {
                const dialMatrix = [
                    this.createPopulateMatrix({ x: 0, y: 0 }, { x: dialHeight, y: dialWidth }),
                    this.createPopulateMatrix({ x: 0, y: dialWidth }, { x: dialHeight, y: dialWidth * 2 }),
                    this.createPopulateMatrix({ x: dialHeight, y: 0 }, { x: dialHeight * 2, y: dialWidth }),
                    this.createPopulateMatrix({ x: dialHeight, y: dialWidth }, { x: dialHeight * 2, y: dialWidth * 2 }),
                ];
                return dialMatrix[coords.x < dialHeight ? (coords.y < dialWidth ? 0 : 1) : coords.y < dialWidth ? 2 : 3];
            }
            case 1: {
                const dialMatrix = new Array(PIXEL_SIZE ** 2);
                for (let i = 0; i < PIXEL_SIZE ** 2; i++) {
                    const topLeft = { x: (i % PIXEL_SIZE) * dialHeight, y: Math.floor(i / PIXEL_SIZE) * dialWidth };
                    const bottomRight = { x: topLeft.x + dialHeight, y: topLeft.y + dialWidth };
                    dialMatrix[i] = this.createPopulateMatrix(topLeft, bottomRight);
                }
                const dialIndex = Math.floor(coords.y / dialWidth) * PIXEL_SIZE + Math.floor(coords.x / dialHeight);
                return dialMatrix[dialIndex];
            }
        }
    }

    private createPopulateMatrix(start: Vec2, end: Vec2): number[][] {
        const differenceMatrix = this.detectionDifferenceService.createEmptyMatrix(
            this.component.height,
            this.component.width,
            PossibleColor.EMPTYPIXEL,
        );
        for (let i = start.x; i < end.x; i++) {
            for (let j = start.y; j < end.y; j++) {
                differenceMatrix[i][j] = PossibleColor.BLACK;
            }
        }
        return differenceMatrix;
    }

    private updateContexts() {
        this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
        this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
    }
}
