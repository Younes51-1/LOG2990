import { TestBed } from '@angular/core/testing';

import { GameFinderService } from './game-finder.service';

describe('GameFinderService', () => {
    let service: GameFinderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameFinderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
