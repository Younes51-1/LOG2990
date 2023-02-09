import { TestBed } from '@angular/core/testing';

import { DifferencesFoundService } from './differences-found.service';

describe('GameServiceService', () => {
    let service: DifferencesFoundService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferencesFoundService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
