import { TestBed } from '@angular/core/testing';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    const component = GameCardComponent;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
