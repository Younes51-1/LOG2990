import { Component, Input } from '@angular/core';
import { Constants } from 'src/assets/variables/constants';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-config-params',
    templateUrl: './config-params.component.html',
    styleUrls: ['./config-params.component.scss'],
})
export class ConfigParamsComponent {
    @Input() initialTime: number = Time.HalfMinute;
    @Input() penaltyTime: number = Time.FiveSeconds;
    @Input() bonusTime: number = Time.FiveSeconds;

    isInvalidInput: boolean = false;

    constructor(private verifyInput: VerifyInputService) {}

    manuallyChangeValue(inputType: string, value: string) {
        if (!this.verifyInput.verifyNumber(value, inputType)) {
            this.isInvalidInput = true;
            return;
        }
        this.isInvalidInput = false;
        switch (inputType) {
            case 'initialTime':
                this.initialTime = +value;
                break;
            case 'penaltyTime':
                this.penaltyTime = +value;
                break;
            case 'bonusTime':
                this.bonusTime = +value;
                break;
            default:
                break;
        }
    }

    buttonIncreaseInitialTime() {
        this.resetInvalidInput();
        const maxInitialTime = Constants.MaxInitialTime;
        if (this.initialTime + Time.FiveSeconds <= maxInitialTime) {
            this.initialTime = this.initialTime + Time.FiveSeconds;
        } else {
            this.initialTime = maxInitialTime;
        }
    }

    buttonDecreaseInitialTime() {
        this.resetInvalidInput();
        const minInitialTime = Constants.MinInitialTime;
        if (this.initialTime - Time.FiveSeconds >= minInitialTime) {
            this.initialTime = this.initialTime - Time.FiveSeconds;
        } else {
            this.initialTime = minInitialTime;
        }
    }

    buttonIncreasePenalty() {
        this.resetInvalidInput();
        const maxPenaltyTime = Constants.MaxPenaltyTime;
        this.penaltyTime = this.penaltyTime + 1 <= maxPenaltyTime ? this.penaltyTime + 1 : maxPenaltyTime;
    }

    buttonDecreasePenalty() {
        this.resetInvalidInput();
        const minPenaltyTime = Constants.MinPenaltyTime;
        this.penaltyTime = this.penaltyTime - 1 >= minPenaltyTime ? this.penaltyTime - 1 : minPenaltyTime;
    }

    buttonIncreaseBonus() {
        this.resetInvalidInput();
        const maxBonusTime = Constants.MaxBonusTime;
        this.bonusTime = this.bonusTime + 1 <= maxBonusTime ? this.bonusTime + 1 : maxBonusTime;
    }

    buttonDecreaseBonus() {
        this.resetInvalidInput();
        const minBonusTime = Constants.MinBonusTime;
        this.bonusTime = this.bonusTime - 1 >= minBonusTime ? this.bonusTime - 1 : minBonusTime;
    }

    private resetInvalidInput() {
        this.isInvalidInput = false;
    }
}
