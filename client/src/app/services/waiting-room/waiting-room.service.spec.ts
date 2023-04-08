import { TestBed } from '@angular/core/testing';

import { WaitingRoomService } from './waiting-room.service';

describe('WaitingRoomService', () => {
    let service: WaitingRoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WaitingRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
