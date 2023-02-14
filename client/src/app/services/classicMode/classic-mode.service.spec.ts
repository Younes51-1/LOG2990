import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData } from '@app/interfaces/game-data';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ClassicModeService } from './classic-mode.service';

const differenceMatrix: number[][] = [[]];
const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
const gameData: GameData = { gameForm, differenceMatrix };
const gameRoom = { userGame: { gameData, nbDifferenceFound: 0, timer: 0, username: 'Test' }, roomId: 'fakeId' };
const differenceTry: DifferenceTry = { validated: true, differencePos: { x: 0, y: 0 } };

class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('ClassicModeService', () => {
    let service: ClassicModeService;
    let communicationSocketService: CommunicationSocketService;
    let communicationService: CommunicationService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunicationSocketService, CommunicationService, { provide: CommunicationSocketService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(ClassicModeService);
        service.handleSocket();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should end the game', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        const spy2 = spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service.endGame();
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should validate the difference', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        expect(service.canSendValidate).toBeTruthy();
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        service.validateDifference({ x: 0, y: 0 });
        expect(service.canSendValidate).toBeFalsy();
        expect(spy).toHaveBeenCalled();
    });

    it('should not validate the difference', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        service.canSendValidate = false;
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        service.validateDifference({ x: 0, y: 0 });
        expect(service.canSendValidate).toBeFalsy();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should start the game', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        service.gameRoom = {
            userGame: {
                gameData,
                nbDifferenceFound: 0,
                timer: 0,
                username: 'Test',
            },
            roomId: '',
        };
        service.startGame();
        expect(spy).toHaveBeenCalled();
    });

    it('should not connect to the server', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        const spy2 = spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        service.connect();
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should connect to the server', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return false;
        });
        const spy2 = spyOn(communicationSocketService, 'connect').and.callFake(() => {
            return;
        });
        const spy3 = spyOn(service, 'handleSocket').and.callFake(() => {
            return;
        });
        service.connect();
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(spy3).toHaveBeenCalled();
    });

    it('should initialize classic mode', () => {
        communicationService = TestBed.inject(CommunicationService);
        spyOn(communicationService, 'getGame').and.returnValue(of(gameData));
        const spy2 = spyOn(service, 'connect').and.callFake(() => {
            return;
        });
        service.initClassicMode('', '');
        expect(spy2).toHaveBeenCalled();
    });

    it('should handle on waiting message', () => {
        const spy = spyOn(service, 'startGame').and.callFake(() => {
            return;
        });
        socketHelper.peerSideEmit('waiting');
        expect(spy).toHaveBeenCalled();
    });

    it('should handle on started message', () => {
        service.gameRoom = gameRoom;
        service.gameRoom.roomId = '';
        socketHelper.peerSideEmit('started', gameRoom.roomId);
        expect(service.gameRoom.roomId).toEqual(gameRoom.roomId);
    });

    it('should handle on validated message', () => {
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('validated', differenceTry);
        expect(service.gameRoom.userGame.nbDifferenceFound).toEqual(1);
        expect(service.serverValidateResponse$).toBeTruthy();
    });

    it('should handle on GameFinished message', () => {
        service.gameRoom = gameRoom;
        const spy = spyOn(socketServiceMock, 'disconnect').and.callFake(() => {
            return;
        });
        socketHelper.peerSideEmit('GameFinished', gameData);
        expect(service.gameFinished$).toBeTruthy();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle on timer message', () => {
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('timer', 1);
        expect(service.gameRoom.userGame.timer).toEqual(1);
    });
});
