import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { options, PageKeys } from './game-card-options';
import { GameForm } from '@app/interfaces/game-form';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() page: PageKeys;
    @Input() slide: GameForm;

    @Output() notify = new EventEmitter();

    routeOne: string;
    btnOne: string;
    routeTwo: string;
    btnTwo: string;

    showInput1 = false;
    showInput2 = false;
    inputValue1: string;
    inputValue2: string;

    ngOnInit() {
        const { routeOne, btnOne, routeTwo, btnTwo } = options[this.page] || {};
        this.routeOne = routeOne;
        this.btnOne = btnOne;
        this.routeTwo = routeTwo;
        this.btnTwo = btnTwo;
    }

    btnOneEmitter() {
        this.notify.emit(this.slide.name);
    }

    btnTwoEmitter() {
        this.notify.emit(this.slide);
    }
}
