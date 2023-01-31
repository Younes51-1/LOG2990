import { Component, Input, OnInit } from '@angular/core';
import { options, PageKeys } from './game-card-options';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() page: PageKeys;

    routeOne: string;
    btnOne: string;
    routeTwo: string;
    btnTwo: string;

    gameTitle = 'Titre';

    difficultyLevel = 'Niveau de difficulté';

    bestSoloTimeOne = 1;
    bestSoloTimeTwo = 2;
    bestSoloTimeThree = 3;

    bestPvpOne = 1;
    bestPvpTwo = 2;
    bestPvpThree = 3;

    ngOnInit() {
        const { routeOne, btnOne, routeTwo, btnTwo } = options[this.page] || {};
        this.routeOne = routeOne;
        this.btnOne = btnOne;
        this.routeTwo = routeTwo;
        this.btnTwo = btnTwo;
    }
}
