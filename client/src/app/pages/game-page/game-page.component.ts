import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, AfterViewInit, OnDestroy {
    gameName = 'testset';
    player: string = 'player1';

    constructor(private classicModeService: ClassicModeService) {}

    ngOnInit() {
        this.classicModeService.initClassicMode(this.gameName, this.player);
    }

    ngAfterViewInit() {
        this.classicModeService.startGame();
    }

    ngOnDestroy() {
        this.classicModeService.quitGame();
    }
}
