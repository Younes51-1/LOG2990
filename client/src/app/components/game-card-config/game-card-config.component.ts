import { Component } from '@angular/core';

@Component({
    selector: 'app-game-card-config',
    templateUrl: './game-card-config.component.html',
    styleUrls: ['./game-card-config.component.scss'],
})
export class GameCardConfigComponent {
    gameTitle = 'Titre';

    difficultyLevel = 'Niveau de difficulté';

    bestSoloTimeOne = 1;
    bestSoloTimeTwo = 2;
    bestSoloTimeThree = 3;

    bestPvpOne = 1;
    bestPvpTwo = 2;
    bestPvpThree = 3;
}
