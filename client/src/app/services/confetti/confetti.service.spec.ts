import { TestBed } from '@angular/core/testing';

import { ConfettiService } from '@app/services/confetti/confetti.service';

describe('ConfettiService', () => {
    let service: ConfettiService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ConfettiService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
