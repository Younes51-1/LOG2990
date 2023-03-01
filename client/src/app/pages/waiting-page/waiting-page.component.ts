import { Component, OnDestroy } from '@angular/core';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent implements OnDestroy {
    constructor(public classicModeService: ClassicModeService) {}

    ngOnDestroy() {
        this.classicModeService.abortGame();
    }
}
