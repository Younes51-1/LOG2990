import { TestBed } from '@angular/core/testing';

import { ConfigHttpService } from './config-http.service';

describe('GameHistoryHttpService', () => {
    let service: ConfigHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ConfigHttpService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
