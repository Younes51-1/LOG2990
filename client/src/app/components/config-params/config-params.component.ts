import { Component, Input, OnInit } from '@angular/core';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { GameSetupService } from '@app/services/game-setup/game-setup.service';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { Constants } from 'src/assets/variables/constants';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-config-params',
    templateUrl: './config-params.component.html',
    styleUrls: ['./config-params.component.scss'],
})
export class ConfigParamsComponent implements OnInit {
    @Input() initialTime: number;
    @Input() penaltyTime: number;
    @Input() bonusTime: number;

    isInvalidInput: boolean = false;
    feedbackMessage: string = '';
    private timeout: number = Time.Thousand * 3;

    constructor(
        private verifyInput: VerifyInputService,
        private readonly configCommunicationService: ConfigHttpService,
        private gameSetUpService: GameSetupService,
    ) {}

    ngOnInit() {
        this.configCommunicationService.getConstants().subscribe((res) => {
            this.initialTime = res.initialTime;
            this.penaltyTime = res.penaltyTime;
            this.bonusTime = res.bonusTime;
        });
    }

    manuallyChangeInitialTime(value: string) {
        if (this.verifyInput.verifyNotNumber(value)) {
            const numericInput = value.replace(/[^0-9]*/g, '');
            document.getElementsByTagName('input')[0].value = numericInput;
            this.initialTime = +numericInput;
        } else if (!this.verifyInput.verifyConstantsInBounds(+value, 'initialTime')) {
            this.isInvalidInput = true;
            this.initialTime = +value;
        } else {
            this.initialTime = +value;
        }
        this.validateAllInputs();
    }

    manuallyChangePenaltyTime(value: string) {
        if (this.verifyInput.verifyNotNumber(value)) {
            const numericInput = value.replace(/[^0-9]*/g, '');
            document.getElementsByTagName('input')[1].value = numericInput;
            this.penaltyTime = +numericInput;
        } else if (!this.verifyInput.verifyConstantsInBounds(+value, 'penaltyTime')) {
            this.isInvalidInput = true;
            this.penaltyTime = +value;
        } else {
            this.penaltyTime = +value;
        }
        this.validateAllInputs();
    }

    manuallyChangeBonusTime(value: string) {
        if (this.verifyInput.verifyNotNumber(value)) {
            const numericInput = value.replace(/[^0-9]*/g, '');
            document.getElementsByTagName('input')[2].value = numericInput;
            this.bonusTime = +numericInput;
        } else if (!this.verifyInput.verifyConstantsInBounds(+value, 'bonusTime')) {
            this.isInvalidInput = true;
            this.bonusTime = +value;
        } else {
            this.bonusTime = +value;
        }
        this.validateAllInputs();
    }

    buttonIncreaseInitialTime() {
        if (this.initialTime < Constants.MinInitialTime) {
            this.initialTime = Constants.MinInitialTime;
        } else {
            const maxInitialTime = Constants.MaxInitialTime;
            this.initialTime = this.initialTime + Time.Five <= maxInitialTime ? this.initialTime + Time.Five : maxInitialTime;
        }
        this.validateAllInputs();
    }

    buttonDecreaseInitialTime() {
        if (this.initialTime > Constants.MaxInitialTime) {
            this.initialTime = Constants.MaxInitialTime;
        } else {
            const minInitialTime = Constants.MinInitialTime;
            this.initialTime = this.initialTime - Time.Five >= minInitialTime ? this.initialTime - Time.Five : minInitialTime;
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
        const constants = {
            initialTime: this.initialTime,
            penaltyTime: this.penaltyTime,
            bonusTime: this.bonusTime,
        };
        this.configCommunicationService.updateConstants(constants).subscribe();
        this.feedbackMessage = 'Nouvelles constantes appliquées avec succès !';
        setTimeout(() => {
            this.feedbackMessage = '';
            this.gameSetUpService.setConstants(constants);
        }, this.timeout);
    }

    resetConstants() {
        this.initialTime = Time.Thirty;
        this.penaltyTime = Time.Five;
        this.bonusTime = Time.Five;
        const constants = {
            initialTime: this.initialTime,
            penaltyTime: this.penaltyTime,
            bonusTime: this.bonusTime,
        };
        this.configCommunicationService.updateConstants(constants).subscribe();
        this.feedbackMessage = 'Constantes réinitialisées avec succès !';
        setTimeout(() => {
            this.feedbackMessage = '';
            this.gameSetUpService.setConstants(constants);
        }, this.timeout);
    }

    private validateAllInputs() {
        this.isInvalidInput =
            !this.verifyInput.verifyConstantsInBounds(this.initialTime, 'initialTime') ||
            !this.verifyInput.verifyConstantsInBounds(this.penaltyTime, 'penaltyTime') ||
            !this.verifyInput.verifyConstantsInBounds(this.bonusTime, 'bonusTime');
    }
}
