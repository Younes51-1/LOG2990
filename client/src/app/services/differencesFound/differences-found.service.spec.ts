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

    it('should update differences counter', () => {
        const spy = spyOn(service.differencesFound$, 'next');
        const newValue = 5;
        service.updateDifferencesFound(newValue);
        expect(spy).toHaveBeenCalledWith(service.getDifferencesFound());
        expect(service.getDifferencesFound()).toEqual(newValue);
    });
});
