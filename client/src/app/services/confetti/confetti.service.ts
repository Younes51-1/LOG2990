import { Injectable } from '@angular/core';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { Dimensions } from 'src/assets/variables/picture-dimension';
import confetti from 'canvas-confetti';
import {
    CONFETTITIMEOUT,
    ConfettiX,
    FIFFTENSECONDS,
    HINTCONFETTI,
    ONENANOSECOND,
    PARTICLECOUNT,
    PARTICLEORIGIN,
    WININIGCONFETTI,
} from 'src/assets/variables/play-area-const';
import { Vec2 } from '@app/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class ConfettiService {
    confettiInterval: ReturnType<typeof setInterval>;
    intervalId: ReturnType<typeof setInterval>;
    constructor(private playAreaService: PlayAreaService) {}

    startConfetti(coords: Vec2 | undefined) {
        clearTimeout(this.playAreaService.hintTimeout);
        clearInterval(this.playAreaService.hintInterval);
        const width = this.playAreaService.component.width;
        const height = this.playAreaService.component.height;
        if (coords) {
            const layer = document.createElement('canvas');
            layer.width = this.playAreaService.component.width;
            layer.height = this.playAreaService.component.height;
            let isFlashing = false;
            const defaults = {
                origin: {
                    x: coords.y / Dimensions.DefaultWidth,
                    y: coords.x / Dimensions.DefaultHeight,
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
            setTimeout(() => this.lastHint(confettiGenerator, defaults), 0);
            setTimeout(() => this.lastHint(confettiGenerator, defaults), CONFETTITIMEOUT);
            setTimeout(() => this.lastHint(confettiGenerator, defaults), 2 * CONFETTITIMEOUT);
            setTimeout(() => this.lastHint(confettiGenerator, defaults), 3 * CONFETTITIMEOUT);
            this.confettiInterval = setInterval(() => {
                if (isFlashing) {
                    this.playAreaService.component.context1.drawImage(this.playAreaService.component.original, 0, 0, width, height);
                    this.playAreaService.component.context2.drawImage(this.playAreaService.component.modified, 0, 0, width, height);
                } else {
                    this.playAreaService.component.context1.drawImage(layer, 0, 0, width, height);
                    this.playAreaService.component.context2.drawImage(layer, 0, 0, width, height);
                }
                isFlashing = !isFlashing;
            }, ONENANOSECOND / this.playAreaService.speed);
            setTimeout(() => {
                clearInterval(this.confettiInterval);
                this.playAreaService.component.context1.drawImage(this.playAreaService.component.original, 0, 0, width, height);
                this.playAreaService.component.context2.drawImage(this.playAreaService.component.modified, 0, 0, width, height);
            }, HINTCONFETTI / this.playAreaService.speed);
        } else {
            const animationEnd = Date.now() + FIFFTENSECONDS;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            this.intervalId = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(this.intervalId);
                }
                const particleCount = timeLeft / PARTICLECOUNT;
                confetti(
                    Object.assign({}, defaults, {
                        particleCount,
                        origin: { x: Math.random() * PARTICLEORIGIN + ConfettiX.X1, y: Math.random() - PARTICLEORIGIN },
                    }),
                );
                confetti(
                    Object.assign({}, defaults, {
                        particleCount,
                        origin: { x: Math.random() * PARTICLEORIGIN + ConfettiX.X2, y: Math.random() - PARTICLEORIGIN },
                    }),
                );
            }, WININIGCONFETTI / this.playAreaService.speed);
        }
    }

    private lastHint(confettiGenerator: (options: object) => void, defaults: object) {
        confettiGenerator({
            ...defaults,
            particleCount: 40,
            scalar: 1.2,
            shapes: ['star'],
        });
        confettiGenerator({
            ...defaults,
            particleCount: 10,
            scalar: 0.75,
            shapes: ['circle'],
        });
    }
}
