/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import confetti from 'canvas-confetti';
import { PossibleColor } from 'src/assets/variables/images-values';

@Injectable({
    providedIn: 'root',
})
export class HelpService {
    isCheatModeOn = false;
    isHintModeOn = false;
    intervalId: ReturnType<typeof setInterval>;
    confettiInterval: ReturnType<typeof setInterval>;
    private component: PlayAreaComponent;
    private cheatIntervalId: ReturnType<typeof setInterval>;
    private hintIntervalId: ReturnType<typeof setInterval>;
    private hintTimeout: ReturnType<typeof setTimeout>;

    constructor(private detectionDifferenceService: DetectionDifferenceService) {}

    setComponent(component: PlayAreaComponent) {
        this.component = component;
    }

    startConfetti(coords: Vec2 | undefined) {
        clearTimeout(this.hintTimeout);
        clearInterval(this.hintIntervalId);
        if (coords) {
            const layer = document.createElement('canvas');
            layer.width = this.component.width;
            layer.height = this.component.height;
            let isFlashing = false;
            const defaults = {
                origin: {
                    x: coords.y / 640,
                    y: coords.x / 480,
                },
                spread: 360,
                ticks: 50,
                gravity: 0,
                decay: 0.94,
                startVelocity: 30,
                shapes: ['star'],
                colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
                zIndex: -1,
            };
            const confettiGenerator = confetti.create(layer, {});
            confettiGenerator({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
            confettiGenerator({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
            setTimeout(() => {
                confettiGenerator({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
                confettiGenerator({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
            }, 100);
            setTimeout(() => {
                confettiGenerator({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
                confettiGenerator({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
            }, 200);
            this.confettiInterval = setInterval(() => {
                if (isFlashing) {
                    this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
                    this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
                } else {
                    this.component.context1.drawImage(layer, 0, 0, this.component.width, this.component.height);
                    this.component.context2.drawImage(layer, 0, 0, this.component.width, this.component.height);
                }
                isFlashing = !isFlashing;
            }, 0.000001);
            setTimeout(() => {
                clearInterval(this.confettiInterval);
                this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            }, 600);
        } else {
            const duration = 15 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            this.intervalId = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(this.intervalId);
                }
                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * (0.3 - 0.1) + 0.1, y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * (0.9 - 0.7) + 0.7, y: Math.random() - 0.2 } }));
            }, 250);
        }
    }

    cheatMode() {
        if (!this.component.context1 || !this.component.context2) {
            return;
        }
        if (!this.isCheatModeOn) {
            this.component.sendCheatEnd.emit();
            clearInterval(this.cheatIntervalId);
            this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
            this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            return;
        }
        const flashDuration = 125;
        let isFlashing = true;
        this.component.verifyDifferenceMatrix('cheat');
        this.component.sendCheatStart.emit({ layer: this.component.cheatLayer });
        this.cheatIntervalId = setInterval(() => {
            if (isFlashing) {
                this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            } else {
                this.component.context1.drawImage(this.component.cheatLayer, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.cheatLayer, 0, 0, this.component.width, this.component.height);
            }
            isFlashing = !isFlashing;
        }, flashDuration);
    }

    hintMode(hintNum: number) {
        if (!this.component.context1 || !this.component.context2) {
            return;
        }
        const flashDuration = 125;
        let isFlashing = true;
        const totalDuration = 2000;
        const diffCoords = this.detectionDifferenceService.findRandomDifference(JSON.parse(JSON.stringify(this.component.differenceMatrix)));
        if (diffCoords) {
            if (hintNum === 2) {
                this.startConfetti(diffCoords);
                this.component.sendHint.emit({ hintNum, diffPos: diffCoords, layer: this.component.hintLayer });
                return;
            } else {
                this.component.verifyDifferenceMatrix('hint', this.chooseDial(diffCoords, hintNum));
            }
            this.component.sendHint.emit({ hintNum, diffPos: diffCoords, layer: this.component.hintLayer });
        }
        clearTimeout(this.hintTimeout);
        clearInterval(this.hintIntervalId);
        this.hintIntervalId = setInterval(() => {
            if (isFlashing) {
                this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            } else {
                this.component.context1.drawImage(this.component.hintLayer, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.hintLayer, 0, 0, this.component.width, this.component.height);
            }
            isFlashing = !isFlashing;
        }, flashDuration);
        this.hintTimeout = setTimeout(() => {
            clearInterval(this.hintIntervalId);
            this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
            this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            return;
        }, totalDuration);
    }

    private chooseDial(coords: Vec2, hintNum: number): number[][] {
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
                const dialMatrix = new Array(16);
                for (let i = 0; i < 16; i++) {
                    const topLeft = { x: (i % 4) * dialHeight, y: Math.floor(i / 4) * dialWidth };
                    const bottomRight = { x: topLeft.x + dialHeight, y: topLeft.y + dialWidth };
                    dialMatrix[i] = this.createPopulateMatrix(topLeft, bottomRight);
                }
                const dialIndex = Math.floor(coords.y / dialWidth) * 4 + Math.floor(coords.x / dialHeight);
                return dialMatrix[dialIndex];
            }
            default:
                return [];
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
}
