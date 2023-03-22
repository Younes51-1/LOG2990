import { Component, Input } from '@angular/core';
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
}
