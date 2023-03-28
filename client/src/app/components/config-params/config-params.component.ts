import { Component, Input } from '@angular/core';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { Constants } from 'src/assets/variables/constants';
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

    manuallyChangeValue(inputType: string, value: number) {
        if (!this.verifyInput.verifyNumber(value, inputType)) {
            this.isInvalidInput = true;
        }
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
        }
        this.validateAllInputs();
    }

    buttonIncreaseInitialTime() {
        if (this.initialTime < Constants.MinInitialTime) {
            this.initialTime = Constants.MinInitialTime;
        } else {
            const maxInitialTime = Constants.MaxInitialTime;
            this.initialTime = this.initialTime + Time.FiveSeconds <= maxInitialTime ? this.initialTime + Time.FiveSeconds : maxInitialTime;
        }
        this.validateAllInputs();
    }

    buttonDecreaseInitialTime() {
        if (this.initialTime > Constants.MaxInitialTime) {
            this.initialTime = Constants.MaxInitialTime;
        } else {
            const minInitialTime = Constants.MinInitialTime;
            this.initialTime = this.initialTime - Time.FiveSeconds >= minInitialTime ? this.initialTime - Time.FiveSeconds : minInitialTime;
        }
        this.validateAllInputs();
    }

    buttonIncreasePenalty() {
        if (this.penaltyTime < Constants.MinPenaltyTime) {
            this.penaltyTime = Constants.MinPenaltyTime;
        } else {
            const maxPenaltyTime = Constants.MaxPenaltyTime;
            this.penaltyTime = this.penaltyTime + 1 <= maxPenaltyTime ? this.penaltyTime + 1 : maxPenaltyTime;
        }
        this.validateAllInputs();
    }

    buttonDecreasePenalty() {
        if (this.penaltyTime > Constants.MaxPenaltyTime) {
            this.penaltyTime = Constants.MaxPenaltyTime;
        } else {
            const minPenaltyTime = Constants.MinPenaltyTime;
            this.penaltyTime = this.penaltyTime - 1 >= minPenaltyTime ? this.penaltyTime - 1 : minPenaltyTime;
        }
        this.validateAllInputs();
    }

    buttonIncreaseBonus() {
        if (this.bonusTime < Constants.MinBonusTime) {
            this.bonusTime = Constants.MinBonusTime;
        } else {
            const maxBonusTime = Constants.MaxBonusTime;
            this.bonusTime = this.bonusTime + 1 <= maxBonusTime ? this.bonusTime + 1 : maxBonusTime;
        }
        this.validateAllInputs();
    }

    buttonDecreaseBonus() {
        if (this.bonusTime > Constants.MaxBonusTime) {
            this.bonusTime = Constants.MaxBonusTime;
        } else {
            const minBonusTime = Constants.MinBonusTime;
            this.bonusTime = this.bonusTime - 1 >= minBonusTime ? this.bonusTime - 1 : minBonusTime;
        }
        this.validateAllInputs();
    }

    applyNewConstants() {
        // TODO: apply new constants to all games
        return;
    }

    private validateAllInputs() {
        this.isInvalidInput =
            !this.verifyInput.verifyNumber(this.initialTime, 'initialTime') ||
            !this.verifyInput.verifyNumber(this.penaltyTime, 'penaltyTime') ||
            !this.verifyInput.verifyNumber(this.bonusTime, 'bonusTime');
    }
}
