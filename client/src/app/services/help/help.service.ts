import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';

@Injectable({
    providedIn: 'root',
})
export class HelpService {
    isCheatModeOn = false;
    isHintModeOn = false;
    private component: PlayAreaComponent;
    private cheatIntervalId: ReturnType<typeof setInterval>;
    private hintIntervalId: ReturnType<typeof setInterval>;

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

    hintMode() {
        if (!this.component.context1 || !this.component.context2) {
            return;
        }
        const flashDuration = 125;
        let isFlashing = true;
        const totalDuration = 5000;
        this.component.verifyDifferenceMatrix('hint');
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
}
