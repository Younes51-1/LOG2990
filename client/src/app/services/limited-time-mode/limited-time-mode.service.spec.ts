/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatService } from '@app/services/chat/chat.service';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Socket } from 'socket.io-client';
import { LimitedTimeModeService } from '@app/services/limited-time-mode/limited-time-mode.service';

class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('LimitedTimeModeService', () => {
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let service: LimitedTimeModeService;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        (socketServiceMock as any).socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ChatService, CommunicationSocketService, CommunicationHttpService],
        });
        service = TestBed.inject(LimitedTimeModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
