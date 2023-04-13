/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { GameFinderService } from './game-finder.service';
import { GameContext } from '@app/interfaces/game';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';

class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('GameFinderService', () => {
    let gameContextLimitedTime: GameContext;
    let gameContextClassic: GameContext;

    let service: GameFinderService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        gameContextLimitedTime = { gameName: 'test', gameMode: 'limited-time-mode' };
        gameContextClassic = { gameName: 'test', gameMode: 'classic-mode' };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        (socketServiceMock as any).socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            providers: [CommunicationSocketService, { provide: CommunicationSocketService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(GameFinderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check game', () => {
        const connectSpy = spyOn(service, 'connectSocket').and.stub();
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        const onSpy = spyOn(socketServiceMock, 'on').and.stub();
        service.checkGame();
        expect(connectSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalled();
        expect(onSpy).toHaveBeenCalled();
    });

    it('should set gameExists$ to true if game is found and gameMode is limited-time-mode', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next');
        service.gameMode = 'limited-time-mode';
        service.checkGame();
        socketHelper.peerSideEmit('gameFound', gameContextLimitedTime);
        expect(gameExistsSpy).toHaveBeenCalledWith(true);
    });

    it('should set gameExists$ to true if game is found and gameName is the same', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next');
        service.gameMode = 'classic-mode';
        service.checkGame('test');
        socketHelper.peerSideEmit('gameFound', gameContextClassic);
        expect(gameExistsSpy).toHaveBeenCalledWith(true);
    });

    it('should set gameExists$ to false if gameDeleted is received and gameMode is limited-time-mode', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next');
        service.gameMode = 'limited-time-mode';
        service.checkGame();
        socketHelper.peerSideEmit('gameDeleted', gameContextLimitedTime);
        expect(gameExistsSpy).toHaveBeenCalledWith(false);
    });

    it('should set gameExists$ to false if gameDeleted is received and gameName is the same', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next');
        service.gameMode = 'classic-mode';
        service.checkGame('test');
        socketHelper.peerSideEmit('gameDeleted', gameContextClassic);
        expect(gameExistsSpy).toHaveBeenCalledWith(false);
    });

    it('should connect socket if it is not alive', () => {
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
        const connectSpy = spyOn(socketServiceMock, 'connect').and.stub();
        service.connectSocket();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should not connect socket if it is alive', () => {
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const connectSpy = spyOn(socketServiceMock, 'connect').and.stub();
        service.connectSocket();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(connectSpy).not.toHaveBeenCalled();
    });

    it('should disconnect socket if it is alive', () => {
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect').and.stub();
        service.disconnectSocket();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should not disconnect socket if it is not alive', () => {
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect').and.stub();
        service.disconnectSocket();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(disconnectSpy).not.toHaveBeenCalled();
    });

    // TODO fix these 2 tests
    it('should disconnect socket when cannotJoinGame is received', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        const onSpy = spyOn(socketServiceMock, 'on').and.stub();
        const disconnectSpy = spyOn(service, 'disconnectSocket').and.stub();
        const gameCardMock = jasmine.createSpyObj('GameCardComponent', ['applyBorder']);
        service.canJoinGame('test', gameCardMock);
        socketHelper.peerSideEmit('cannotJoinGame');
        expect(sendSpy).toHaveBeenCalled();
        expect(onSpy).toHaveBeenCalled();
        expect(gameCardMock.applyBorder).toBeTrue();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should join game when canJoinGame is received', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        const onSpy = spyOn(socketServiceMock, 'on').and.stub();
        const gameCardMock = jasmine.createSpyObj('GameCardComponent', ['joinGame']);
        service.canJoinGame('test', gameCardMock, 'test');
        socketHelper.peerSideEmit('canJoinGame');
        expect(sendSpy).toHaveBeenCalled();
        expect(onSpy).toHaveBeenCalled();
        expect(gameCardMock.joinGame).toHaveBeenCalled();
    });
});
