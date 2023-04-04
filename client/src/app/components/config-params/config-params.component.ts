import { Component, Input } from '@angular/core';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-config-params',
    templateUrl: './config-params.component.html',
    styleUrls: ['./config-params.component.scss'],
})
export class ConfigParamsComponent {
    @Input() initialTime = Time.Thirty;
    @Input() penaltyTime = Time.Five;
    @Input() bonusTime = Time.Five;

    increaseValue(time: string) {
        switch (time) {
            case 'initialTime':
                this.initialTime += Time.Five;
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
                this.initialTime -= Time.Five;
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
