import { TestBed } from '@angular/core/testing';

import { GameHistoryHttpService } from './game-history-http.service';

describe('GameHistoryHttpService', () => {
    let service: GameHistoryHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameHistoryHttpService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
