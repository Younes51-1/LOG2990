import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';

describe('CommunicationSocketService', () => {
    let service: CommunicationSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
