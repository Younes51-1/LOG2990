/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { PossibleColor } from 'src/assets/variables/images-values';
@Injectable({
    providedIn: 'root',
})
export class HelpService {
    isCheatModeOn = false;
    isHintModeOn = false;
    private component: PlayAreaComponent;
    private cheatIntervalId: ReturnType<typeof setInterval>;
    private hintIntervalId: ReturnType<typeof setInterval>;

    constructor(private detectionDifferenceService: DetectionDifferenceService) {}

    setComponent(component: PlayAreaComponent) {
        this.component = component;
    }

    cheatMode() {
        if (!this.component.context1 || !this.component.context2) {
            return;
        }
        if (!this.isCheatModeOn) {
            clearInterval(this.cheatIntervalId);
            this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
            this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            return;
        }
        const flashDuration = 125;
        let isFlashing = true;
        this.component.verifyDifferenceMatrix('cheat');
        this.cheatIntervalId = setInterval(() => {
            if (isFlashing) {
                this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            } else {
                this.component.context1.drawImage(this.component.layer, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.layer, 0, 0, this.component.width, this.component.height);
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
        const totalDuration = 5000;
        const diffCoord = this.detectionDifferenceService.findRandomDifference(JSON.parse(JSON.stringify(this.component.differenceMatrix)));
        if (hintNum === 1) {
            if (diffCoord) {
                this.component.verifyDifferenceMatrix('hint', this.chooseDial(diffCoord));
            }
        } else if (hintNum === 2) {
            if (diffCoord) {
                this.component.verifyDifferenceMatrix('hint', this.chooseDial(diffCoord));
            }
        } else {
            if (diffCoord) {
                this.component.verifyDifferenceMatrix('hint', this.chooseDial(diffCoord));
            }
        }
        this.hintIntervalId = setInterval(() => {
            if (isFlashing) {
                this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            } else {
                this.component.context1.drawImage(this.component.layer, 0, 0, this.component.width, this.component.height);
                this.component.context2.drawImage(this.component.layer, 0, 0, this.component.width, this.component.height);
            }
            isFlashing = !isFlashing;
        }, flashDuration);
        setTimeout(() => {
            clearInterval(this.hintIntervalId);
            this.component.context1.drawImage(this.component.original, 0, 0, this.component.width, this.component.height);
            this.component.context2.drawImage(this.component.modified, 0, 0, this.component.width, this.component.height);
            return;
        }, totalDuration);
    }

    private chooseDial(coords: Vec2): number[][] {
        let dial = '';
        if (0 < coords.x && coords.x < 320) {
            if (coords.y && coords.y < 240) {
                dial = 'northWest';
            } else {
                dial = 'southWest';
            }
        } else {
            if (coords.y && coords.y < 240) {
                dial = 'northEast';
            } else {
                dial = 'southEast';
            }
        }

        const undefinedMatrix = this.detectionDifferenceService.createEmptyMatrix(0, 0, 0);
        switch (dial) {
            case 'northWest':
                return this.createPopulateMatrix({ x: 0, y: 0 }, { x: 320, y: 240 });
            case 'northEast':
                return this.createPopulateMatrix({ x: 320, y: 0 }, { x: 640, y: 240 });
            case 'southWest':
                return this.createPopulateMatrix({ x: 0, y: 240 }, { x: 320, y: 480 });
            case 'southEast':
                return this.createPopulateMatrix({ x: 320, y: 240 }, { x: 640, y: 480 });
            default:
                return undefinedMatrix;
        }
    }

    private createPopulateMatrix(start: Vec2, end: Vec2): number[][] {
        const differenceMatrix = this.detectionDifferenceService.createEmptyMatrix(
            this.component.height,
            this.component.width,
            PossibleColor.EMPTYPIXEL,
        );
        for (let i = start.y; i < end.y; i++) {
            for (let j = start.x; j < end.x; j++) {
                differenceMatrix[i][j] = PossibleColor.BLACK;
            }
        }
        return differenceMatrix;
    }
}
