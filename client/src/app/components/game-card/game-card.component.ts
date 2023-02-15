import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { options, PageKeys } from 'src/assets/variables/game-card-options';
import { GameForm } from '@app/interfaces/game';
import { Router } from '@angular/router';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';

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

    applyBorder = false;
    showInput1 = false;
    showInput2 = false;
    inputValue1: string;
    inputValue2: string;

    constructor(public classicModeService: ClassicModeService, private router: Router) {}
    ngOnInit() {
        const { routeOne, btnOne, routeTwo, btnTwo } = options[this.page];
        this.routeOne = routeOne;
        this.btnOne = btnOne;
        this.routeTwo = routeTwo;
        this.btnTwo = btnTwo;
    }

    btnOneEmitter() {
        if (this.page === PageKeys.Selection) {
            this.classicModeService.initClassicMode(this.slide.name, this.inputValue1);
        }
        this.notify.emit(this.slide.name);
    }

    btnTwoEmitter() {
        this.notify.emit(this.slide);
    }

    toggleBorder() {
        if (!this.inputValue1) {
            this.applyBorder = !this.applyBorder;
        } else {
            this.btnOneEmitter();
            this.router.navigate([this.routeOne]);
        }
    }
}
