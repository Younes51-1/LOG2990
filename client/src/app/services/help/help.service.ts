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
        const totalDuration = 2000;
        const diffCoord = this.detectionDifferenceService.findRandomDifference(JSON.parse(JSON.stringify(this.component.differenceMatrix)));
        if (diffCoord) {
            this.component.verifyDifferenceMatrix('hint', this.chooseDial(diffCoord, hintNum));
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
            case 2:
                return [];
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
