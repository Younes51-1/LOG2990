import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
        }).compileComponents();
    });


});
