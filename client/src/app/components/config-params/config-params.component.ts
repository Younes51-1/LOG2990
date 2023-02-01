/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-config-params',
    templateUrl: './config-params.component.html',
    styleUrls: ['./config-params.component.scss'],
})
export class ConfigParamsComponent {
    @Input() initialTime = 30;
    @Input() penaltyTime = 5;
    @Input() bonusTime = 5;

    @Output() initialTimeChange = new EventEmitter();
    @Output() penaltyTimeChange = new EventEmitter();
    @Output() bonusTimeChange = new EventEmitter();

    // TODO finish implementation for increase/decrease buttons
    // increaseValue(time: string) {
    //     switch (time) {
    //         case 'initialTime':
    //             this.initialTime += 5;
    //             break;
    //         case 'penaltyTime':
    //             this.penaltyTime++;
    //             break;
    //         case 'bonusTime':
    //             this.bonusTime++;
    //             break;
    //         default:
    //             break;
    //     }
    // }

    // decreaseValue(time: string) {
    //     switch (time) {
    //         case 'initialTime':
    //             this.initialTime -= 5;
    //             break;
    //         case 'penaltyTime':
    //             this.penaltyTime--;
    //             break;
    //         case 'bonusTime':
    //             this.bonusTime--;
    //             break;
    //         default:
    //             break;
    //     }
    // }
}
