import { TestBed } from '@angular/core/testing';

import { DetectionDifferenceService } from './detection-difference.service';

describe('DetectionDifferenceService', () => {
    let service: DetectionDifferenceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DetectionDifferenceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
