import { Component, Input } from '@angular/core';

// TODO : Avoir un fichier séparé pour les constantes!
export enum Time {
    HalfMinute = 30,
    FiveSeconds = 5,
}

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
