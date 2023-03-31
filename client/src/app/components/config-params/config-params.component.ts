import { Component, Input } from '@angular/core';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-config-params',
    templateUrl: './config-params.component.html',
    styleUrls: ['./config-params.component.scss'],
})
export class ConfigParamsComponent {
    @Input() initialTime = Time.HalfMinute;
    @Input() penaltyTime = Time.FiveSeconds;
    @Input() bonusTime = Time.FiveSeconds;

    constructor(private readonly configCommunicationService: ConfigHttpService) {}

    increaseValue(time: string) {
        switch (time) {
            case 'initialTime':
                this.initialTime += Time.FiveSeconds;
                break;
            case 'penaltyTime':
                this.penaltyTime++;
                break;
            case 'bonusTime':
                this.bonusTime++;
                break;
            default:
                break;
        }
    }

    decreaseValue(time: string) {
        switch (time) {
            case 'initialTime':
                this.initialTime -= Time.FiveSeconds;
                break;
            case 'penaltyTime':
                this.penaltyTime--;
                break;
            case 'bonusTime':
                this.bonusTime--;
                break;
            default:
                break;
        }
    }

    resetConstants() {
        // TODO: fix avec la branche feature/constantes_de_jeu
        this.initialTime = Time.HalfMinute;
        this.penaltyTime = Time.FiveSeconds;
        this.bonusTime = Time.FiveSeconds;
        const constants = {
            initialTime: this.initialTime,
            penaltyTime: this.penaltyTime,
            bonusTime: this.bonusTime,
        };
        this.configCommunicationService.updateConstants(constants);
    }
}
