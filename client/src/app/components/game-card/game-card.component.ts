import { Component } from '@angular/core';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    gameTitle = 'Titre';

    difficultyLevel = 'Niveau de difficulté';

    bestSoloTimeOne = 1;
    bestSoloTimeTwo = 2;
    bestSoloTimeThree = 3;

    bestPvpOne = 1;
    bestPvpTwo = 2;
    bestPvpThree = 3;
}
