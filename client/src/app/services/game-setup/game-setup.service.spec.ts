import { TestBed } from '@angular/core/testing';

import { GameSetupService } from './game-setup.service';

describe('GameSetupService', () => {
    let service: GameSetupService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameSetupService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
