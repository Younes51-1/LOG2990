import { TestBed } from '@angular/core/testing';

import { LimitedTimeModeService } from '@app/services/limited-time-mode/limited-time-mode.service';

describe('LimitedTimeModeService', () => {
    let service: LimitedTimeModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LimitedTimeModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
