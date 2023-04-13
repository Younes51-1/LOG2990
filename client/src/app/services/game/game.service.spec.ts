/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { BestTime, GameData, GameRoom, NewBestTime } from '@app/interfaces/game';
import { ChatService } from '@app/services/chat/chat.service';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { GameService } from '@app/services/game/game.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

class ChatServiceMock extends ChatService {
    override handleMessage() {
        return;
    }
}

describe('GameService', () => {
    let differenceMatrix: number[][];
    let gameData: GameData;
    let gameRoom: GameRoom;
    let differenceTry: DifferenceTry;
    let newBestTimes: BestTime[];

    let service: GameService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationHttpService>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let chatServiceMock: ChatServiceMock;
    let configHttpServiceSpy: jasmine.SpyObj<ConfigHttpService>;

    beforeEach(() => {
        differenceMatrix = [[]];
        gameData = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulty: '', soloBestTimes: [], vsBestTimes: [], differenceMatrix };
        newBestTimes = [
            { name: 'Player 1', time: 60 },
            { name: 'Player 2', time: 120 },
            { name: 'Player 3', time: 180 },
        ];
        gameRoom = {
            userGame: { gameData, nbDifferenceFound: 0, timer: 0, username1: 'Test' },
            roomId: 'fakeId',
            started: false,
            gameMode: 'mode classique',
        };
        differenceTry = { validated: true, differencePos: { x: 0, y: 0 }, username: 'Test' };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        (socketServiceMock as any).socket = socketHelper as unknown as Socket;
        chatServiceMock = new ChatServiceMock(socketServiceMock);
        configHttpServiceSpy = jasmine.createSpyObj('ConfigHttpService', ['getConstants', 'getBestTime', 'updateBestTime']);
        configHttpServiceSpy.getConstants.and.returnValue(of({ initialTime: 10, bonusTime: 2, penaltyTime: 0 }));
        configHttpServiceSpy.getBestTime.and.returnValue(of({ soloBestTimes: newBestTimes, vsBestTimes: newBestTimes }));
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getAllGames']);
        communicationServiceSpy.getAllGames.and.returnValue(of([gameData]));
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ChatService,
                CommunicationSocketService,
                CommunicationHttpService,
                ConfigHttpService,
                { provide: CommunicationHttpService, useValue: communicationServiceSpy },
                { provide: CommunicationSocketService, useValue: socketServiceMock },
                { provide: ChatService, useValue: chatServiceMock },
                { provide: ConfigHttpService, useValue: configHttpServiceSpy },
            ],
        });
        service = TestBed.inject(GameService);
        service.gameRoom = gameRoom;
        (service as any).handleSocket();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getConstant should call getConstant by configHttpService', () => {
        service.getConstant();
        expect(configHttpServiceSpy.getConstants).toHaveBeenCalled();
        expect(service.gameConstants).toEqual({ initialTime: 10, bonusTime: 2, penaltyTime: 0 });
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

    it('should disconnet socket if it is alive', () => {
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect').and.stub();
        service.disconnectSocket();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should not disconnet socket if it is not alive', () => {
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect').and.stub();
        service.disconnectSocket();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(disconnectSpy).not.toHaveBeenCalled();
    });

    it('should return true when gameMode is limited time', () => {
        service.gameMode = 'limited-time-mode';
        expect(service.isLimitedTimeMode()).toBeTrue();
    });

    it('startGame should assign values', () => {
        const handleMessageSpy = spyOn(chatServiceMock, 'handleMessage').and.stub();
        const handleSocketSpy = spyOn(service as any, 'handleSocket').and.stub();
        service.startGame(gameRoom, 'test');
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.username).toEqual('test');
        expect(service.gameMode).toEqual('mode classique');
        expect(handleMessageSpy).toHaveBeenCalled();
        expect(handleSocketSpy).toHaveBeenCalled();
    });

    it('connect socket and send start should only called by gameCreator in startGame', () => {
        const handleMessageSpy = spyOn(chatServiceMock, 'handleMessage').and.stub();
        const handleSocketSpy = spyOn(service as any, 'handleSocket').and.stub();
        const connectSocketSpy = spyOn(service, 'connectSocket').and.stub();
        const startGameSpy = spyOn(socketServiceMock, 'send').and.stub();
        service.startGame(gameRoom, gameRoom.userGame.username1);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.username).toEqual(gameRoom.userGame.username1);
        expect(service.gameMode).toEqual('mode classique');
        expect(handleMessageSpy).toHaveBeenCalled();
        expect(handleSocketSpy).toHaveBeenCalled();
        expect(connectSocketSpy).toHaveBeenCalled();
        expect(startGameSpy).toHaveBeenCalledWith('start', gameRoom.roomId);
    });

    it('getAllGames should be called only in limited time mode in startGame', () => {
        const handleMessageSpy = spyOn(chatServiceMock, 'handleMessage').and.stub();
        const handleSocketSpy = spyOn(service as any, 'handleSocket').and.stub();
        gameRoom.gameMode = 'limited-time-mode';
        const getAllGamesSpy = spyOn(service, 'getAllGames').and.stub();
        service.startGame(gameRoom, 'test');
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.username).toEqual('test');
        expect(service.gameMode).toEqual('limited-time-mode');
        expect(handleMessageSpy).toHaveBeenCalled();
        expect(handleSocketSpy).toHaveBeenCalled();
        expect(getAllGamesSpy).toHaveBeenCalled();
    });

    it('turnOffWaitingSocket should call off by socket', () => {
        const offSpy = spyOn(socketServiceMock, 'off').and.stub();
        service.turnOffWaitingSocket();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(offSpy).toHaveBeenCalledTimes(5);
    });

    it('getAllGames should call getAllGames by communication service', () => {
        service.getAllGames();
        expect(communicationServiceSpy.getAllGames).toHaveBeenCalled();
    });

    it('should abort the game creation', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        spyOn(service, 'disconnectSocket').and.stub();
        service.gameRoom = gameRoom;
        service.username = gameRoom.userGame.username1;
        service.abortGame();
        expect(sendSpy).toHaveBeenCalledWith('abortGameCreation', service.gameRoom.roomId);
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should leave game', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        spyOn(service, 'disconnectSocket').and.stub();
        service.gameRoom = gameRoom;
        service.username = 'differentUsername';
        service.abortGame();
        expect(sendSpy).toHaveBeenCalledWith('leaveGame', { roomId: service.gameRoom.roomId, username: service.username });
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should validate the difference', () => {
        const spy = spyOn(socketServiceMock, 'send').and.stub();
        service.gameRoom = gameRoom;
        service.username = 'test';
        service.sendServerValidate({ x: 0, y: 0 });
        expect((service as any).canSendValidate).toBeFalsy();
        expect(spy).toHaveBeenCalledWith('validate', { roomId: gameRoom.roomId, differencePos: { x: 0, y: 0 }, username: 'test' });
    });

    it('should not validate the difference', () => {
        (service as any).canSendValidate = false;
        const spy = spyOn(socketServiceMock, 'send').and.stub();
        service.sendServerValidate({ x: 0, y: 0 });
        expect((service as any).canSendValidate).toBeFalsy();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should end the game and update constants if its a new best time', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const getBestTimeSpy = configHttpServiceSpy.getBestTime.and.returnValue(of({ soloBestTimes: newBestTimes, vsBestTimes: newBestTimes }));
        const updateBestTimeSpy = configHttpServiceSpy.updateBestTime.and.returnValue(of(0));
        spyOn(service as any, 'updateBestTime').and.callThrough();
        service.gameRoom = gameRoom;
        service.gameRoom.userGame.timer = 1;
        service.gameMode = 'mode classique';
        service.endGame(true, true);
        expect(sendSpy).toHaveBeenCalled();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(getBestTimeSpy).toHaveBeenCalled();
        expect(updateBestTimeSpy).toHaveBeenCalled();
        expect(service.timePosition$).toBeTruthy();
        expect(updateBestTimeSpy).toHaveBeenCalled();
    });

    it('should end the game and not update constants if game mode is limited time', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        const socketAliveSpy = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const updateBestTimeSpy = spyOn(service as any, 'updateBestTime').and.callThrough();
        service.gameRoom = gameRoom;
        service.gameMode = 'limited-time-mode';
        service.gameRoom.userGame.timer = 1;
        service.endGame(true, true);
        expect(sendSpy).toHaveBeenCalled();
        expect(socketAliveSpy).toHaveBeenCalled();
        expect(updateBestTimeSpy).not.toHaveBeenCalled();
    });

    it('changeTime should send a socket', () => {
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        service.gameRoom = gameRoom;
        service.changeTime(1);
        expect(sendSpy).toHaveBeenCalledWith('changeTime', { roomId: gameRoom.roomId, time: 1 });
    });

    it('should reset', () => {
        service.gameRoom = gameRoom;
        service.reset();
        expect(service.gameRoom).toBeUndefined();
        expect((service as any).canSendValidate).toBeTruthy();
        expect(service.username).toEqual('');
        expect(service.userDifferencesFound).toEqual(0);
    });

    it('abandonGame should send a socket', () => {
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        service.username = 'test';
        service.gameRoom = gameRoom;
        service.abandonGame();
        expect(sendSpy).toHaveBeenCalledWith('abandoned', { roomId: gameRoom.roomId, username: 'test' });
    });

    it('next game should change to next slide', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        gameData.name = 'nextGame';
        service.gameRoom = gameRoom;
        service.slides = [gameData];
        service.nextGame();
        expect(sendSpy).toHaveBeenCalledWith('nextGame', service.gameRoom);
        expect(service.gameRoom.userGame.gameData.name).toEqual('nextGame');
    });

    it('next game should finish game if there is no more slides', () => {
        const gameFinishedSpy = spyOn(service.gameFinished$, 'next');
        service.slides = [];
        service.nextGame();
        expect(gameFinishedSpy).toHaveBeenCalledWith(true);
    });

    it('should handle on started message', () => {
        service.gameRoom = gameRoom;
        service.gameRoom.roomId = '';
        socketHelper.peerSideEmit('started', gameRoom);
        expect(service.gameRoom.roomId).toEqual(gameRoom.roomId);
    });

    it('should handle on validated message', () => {
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('validated', differenceTry);
        expect(service.gameRoom.userGame.nbDifferenceFound).toEqual(1);
        expect(service.serverValidateResponse$).toBeTruthy();
    });

    it('should increment userDifferenceFound if validated and are the same user', () => {
        service.gameRoom = gameRoom;
        service.username = differenceTry.username;
        socketHelper.peerSideEmit('validated', differenceTry);
        expect(service.gameRoom.userGame.nbDifferenceFound).toEqual(1);
        expect(service.serverValidateResponse$).toBeTruthy();
        expect(service.userDifferencesFound).toEqual(1);
        expect(service.userDifferencesFound$).toBeTruthy();
    });

    it('should handle on GameFinished message', () => {
        service.gameRoom = gameRoom;
        const spy = spyOn(service, 'disconnectSocket');
        socketHelper.peerSideEmit('GameFinished');
        expect(service.gameFinished$).toBeTruthy();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle abandoned', () => {
        socketHelper.peerSideEmit('abandoned', { gameRoom, username: 'Test' });
        expect(service.abandoned$).toBeTruthy();
    });

    it('should handle abandoned and call limitedTimeGameAbandoned in limited time mode ', () => {
        const limitedTimeGameAbandonedSpy = spyOn(service as any, 'limitedTimeGameAbandoned').and.stub();
        service.gameMode = 'limited-time-mode';
        socketHelper.peerSideEmit('abandoned', { gameRoom, username: 'Test' });
        expect(service.abandoned$).toBeTruthy();
        expect(limitedTimeGameAbandonedSpy).toHaveBeenCalledWith(gameRoom);
    });

    it('should handle on timer message', () => {
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('timer', 1);
        expect(service.gameRoom.userGame.timer).toEqual(1);
    });

    it('should handle on timer message and end game if time < 0', () => {
        service.gameRoom = gameRoom;
        service.gameMode = 'limited-time-mode';
        service.gameRoom.userGame.timer = -1;
        socketHelper.peerSideEmit('timer', 1);
        expect(service.gameRoom.userGame.timer).toEqual(1);
        expect(service.gameFinished$).toBeTruthy();
    });

    it('should set GameRoom', () => {
        service.gameRoom = undefined as unknown as GameRoom;
        (service as any).limitedTimeGameAbandoned(gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
    });

    it('should update the best time if game finished and winner', () => {
        configHttpServiceSpy.updateBestTime.and.returnValue(of(0));
        service.gameRoom = gameRoom;
        service.username = 'Test User';
        spyOn(service.timePosition$, 'next');
        service.gameRoom.userGame.timer = 1;
        (service as any).updateBestTime(true, true);
        expect(configHttpServiceSpy.updateBestTime).toHaveBeenCalled();
        expect(service.timePosition$.next).toHaveBeenCalledWith(0);
    });

    it('should not update the best time if game finished but not a winner', () => {
        configHttpServiceSpy.updateBestTime.and.returnValue(of(0));
        service.gameRoom = gameRoom;
        service.username = 'Test User';
        service.gameRoom.userGame.timer = 1;
        service.isAbandoned = false;
        (service as any).updateBestTime(true, false);
        expect(configHttpServiceSpy.updateBestTime).not.toHaveBeenCalled();
    });

    it('should not update the best time if game did not finished', () => {
        configHttpServiceSpy.updateBestTime.and.returnValue(of(0));
        service.gameRoom = gameRoom;
        service.username = 'Test User';
        service.gameRoom.userGame.timer = 1;
        service.isAbandoned = false;
        (service as any).updateBestTime(false, false);
        expect(configHttpServiceSpy.updateBestTime).not.toHaveBeenCalled();
    });

    it('should not update the best time if user abandoned', () => {
        configHttpServiceSpy.updateBestTime.and.returnValue(of(0));
        service.gameRoom = gameRoom;
        service.username = 'Test User';
        service.gameRoom.userGame.timer = 1;
        service.isAbandoned = true;
        (service as any).updateBestTime(false, false);
        expect(configHttpServiceSpy.updateBestTime).not.toHaveBeenCalled();
    });

    it('should use vsBestTime in case of multiplayer', () => {
        // user can only defeat vsBestTimes
        const fakeBestTime = [
            { name: 'Player 1', time: 1000 },
            { name: 'Player 2', time: 1200 },
            { name: 'Player 3', time: 1800 },
        ];
        configHttpServiceSpy.getBestTime.and.returnValue(of({ soloBestTimes: newBestTimes, vsBestTimes: fakeBestTime }));
        configHttpServiceSpy.updateBestTime.and.returnValue(of(0));
        spyOn(service.timePosition$, 'next');
        service.gameRoom = gameRoom;
        service.gameRoom.userGame.username2 = 'hello';
        service.gameRoom.userGame.timer = 200;
        service.username = 'Test User';
        const newBestTime = new NewBestTime();
        newBestTime.gameName = gameRoom.userGame.gameData.name;
        newBestTime.time = 200;
        newBestTime.name = 'Test User';
        newBestTime.isSolo = false;
        (service as any).updateBestTime(true, true);
        expect(configHttpServiceSpy.updateBestTime).toHaveBeenCalledWith(gameRoom.userGame.gameData.name, newBestTime);
        expect(service.timePosition$.next).toHaveBeenCalledWith(0);
    });

    it('should not call timePosition$ when server return -1', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        configHttpServiceSpy.updateBestTime.and.returnValue(of(-1));
        spyOn(service.timePosition$, 'next');
        service.gameRoom = gameRoom;
        service.gameRoom.userGame.timer = 1;
        service.username = 'Test User';
        (service as any).updateBestTime(true, true);
        expect(configHttpServiceSpy.updateBestTime).toHaveBeenCalled();
        expect(service.timePosition$.next).not.toHaveBeenCalled();
    });

    it('should not update the best time if getBestTime return undefined', () => {
        configHttpServiceSpy.getBestTime.and.returnValue(of(undefined as any));
        configHttpServiceSpy.updateBestTime.and.returnValue(of(0));
        service.gameRoom = gameRoom;
        service.username = 'Test User';
        service.gameRoom.userGame.timer = 1;
        service.isAbandoned = true;
        (service as any).updateBestTime(false, false);
        expect(configHttpServiceSpy.updateBestTime).not.toHaveBeenCalled();
    });
});
