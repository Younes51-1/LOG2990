import { Injectable } from '@angular/core';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { Dimensions } from 'src/assets/variables/picture-dimension';
import confetti from 'canvas-confetti';
import { Vec2 } from '@app/interfaces/vec2';
import {
    CIRCLE_SHAPES,
    CONFETTI_INTERVAL_DELAY,
    CONFETTI_INTERVAL_DURATION,
    HINT_DURATION,
    HINT_INTERVAL_DELAY,
    HINT_TICKS,
    LAST_HINT_PARTICLE_COUNT,
    PARTICLE_COLORS,
    PARTICLE_COUNT,
    PARTICLE_DECAY,
    PARTICLE_GRAVITY,
    PARTICLE_ORIGIN_MAX_X,
    PARTICLE_ORIGIN_MAX_Y,
    PARTICLE_ORIGIN_MIN_X,
    PARTICLE_ORIGIN_X,
    PARTICLE_SCALAR,
    PARTICLE_SPREAD,
    PARTICLE_START_VELOCITY,
    PARTICLE_ZINDEX,
    STAR_SHAPES,
    WINNING_DURATION,
    WINNING_TICKS,
} from 'src/assets/variables/confetti-const';

@Injectable({
    providedIn: 'root',
})
export class ConfettiService {
    confettiInterval: ReturnType<typeof setInterval>;
    intervalId: ReturnType<typeof setInterval>;
    private playAreaService: PlayAreaService;

    setService(playAreaService: PlayAreaService): void {
        this.playAreaService = playAreaService;
    }

    startConfetti(coords: Vec2 | undefined) {
        clearTimeout(this.playAreaService.hintTimeout);
        clearInterval(this.playAreaService.hintInterval);
        const width = this.playAreaService.component.width;
        const height = this.playAreaService.component.height;
        if (coords) {
            const layer = document.createElement('canvas');
            layer.width = width;
            layer.height = height;
            let isFlashing = false;
            const defaults = {
                origin: {
                    x: coords.y / Dimensions.DefaultWidth,
                    y: coords.x / Dimensions.DefaultHeight,
                },
                spread: PARTICLE_SPREAD,
                ticks: HINT_TICKS,
                gravity: PARTICLE_GRAVITY,
                decay: PARTICLE_DECAY,
                startVelocity: PARTICLE_START_VELOCITY,
                shapes: STAR_SHAPES,
                colors: PARTICLE_COLORS,
                zIndex: PARTICLE_ZINDEX,
            };
            const confettiGenerator = confetti.create(layer, {});
            setTimeout(() => this.lastHint(confettiGenerator, defaults), 0);
            setTimeout(() => this.lastHint(confettiGenerator, defaults), HINT_INTERVAL_DELAY);
            setTimeout(() => this.lastHint(confettiGenerator, defaults), 2 * HINT_INTERVAL_DELAY);
            setTimeout(() => this.lastHint(confettiGenerator, defaults), 3 * HINT_INTERVAL_DELAY);
            this.confettiInterval = setInterval(() => {
                if (isFlashing) {
                    this.playAreaService.component.context1.drawImage(this.playAreaService.component.original, 0, 0, width, height);
                    this.playAreaService.component.context2.drawImage(this.playAreaService.component.modified, 0, 0, width, height);
                } else {
                    this.playAreaService.component.context1.drawImage(layer, 0, 0, width, height);
                    this.playAreaService.component.context2.drawImage(layer, 0, 0, width, height);
                }
                isFlashing = !isFlashing;
            }, CONFETTI_INTERVAL_DELAY / this.playAreaService.speed);
            setTimeout(() => {
                clearInterval(this.confettiInterval);
                this.playAreaService.component.context1.drawImage(this.playAreaService.component.original, 0, 0, width, height);
                this.playAreaService.component.context2.drawImage(this.playAreaService.component.modified, 0, 0, width, height);
            }, HINT_DURATION / this.playAreaService.speed);
        } else {
            const animationEnd = Date.now() + CONFETTI_INTERVAL_DURATION;
            const defaults = { startVelocity: PARTICLE_START_VELOCITY, spread: PARTICLE_SPREAD, ticks: WINNING_TICKS, zIndex: 0 };
            this.intervalId = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(this.intervalId);
                }
                const particleCount = PARTICLE_COUNT * (timeLeft / CONFETTI_INTERVAL_DURATION);
                confetti(
                    Object.assign({}, defaults, {
                        particleCount,
                        origin: { x: Math.random() * PARTICLE_ORIGIN_X + PARTICLE_ORIGIN_MIN_X, y: Math.random() - PARTICLE_ORIGIN_MAX_Y },
                    }),
                );
                confetti(
                    Object.assign({}, defaults, {
                        particleCount,
                        origin: { x: Math.random() * PARTICLE_ORIGIN_X + PARTICLE_ORIGIN_MAX_X, y: Math.random() - PARTICLE_ORIGIN_MAX_Y },
                    }),
                );
            }, WINNING_DURATION / this.playAreaService.speed);
        }
    }

    private lastHint(confettiGenerator: (options: object) => void, defaults: object) {
        confettiGenerator({
            ...defaults,
            particleCount: LAST_HINT_PARTICLE_COUNT[0],
            scalar: PARTICLE_SCALAR[0],
            shapes: STAR_SHAPES,
        });
        confettiGenerator({
            ...defaults,
            particleCount: LAST_HINT_PARTICLE_COUNT[1],
            scalar: PARTICLE_SCALAR[1],
            shapes: CIRCLE_SHAPES,
        });
    }
}
