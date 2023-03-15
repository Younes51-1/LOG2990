/* eslint-disable max-classes-per-file */
/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameData, GameRoom } from '@app/interfaces/game';
import { ChatService } from '@app/services/chatService/chat.service';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';

class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

class ChatServiceMock extends ChatService {
    override handleSocket() {
        return;
    }
}

describe('ClassicModeService', () => {
    let differenceMatrix: number[][];
    let gameForm;
    let gameData: GameData;
    let gameRoom: GameRoom;
    let differenceTry: DifferenceTry;

    let service: ClassicModeService;
    let communicationSocketService: CommunicationSocketService;
    let communicationService: CommunicationService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let chatServiceMock: ChatServiceMock;

    beforeEach(() => {
        differenceMatrix = [[]];
        gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
        gameData = { gameForm, differenceMatrix };
        gameRoom = { userGame: { gameData, nbDifferenceFound: 0, timer: 0, username1: 'Test' }, roomId: 'fakeId', started: false };
        differenceTry = { validated: true, differencePos: { x: 0, y: 0 }, username: 'Test' };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        chatServiceMock = new ChatServiceMock(socketServiceMock);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ChatService,
                CommunicationSocketService,
                CommunicationService,
                { provide: CommunicationSocketService, useValue: socketServiceMock },
                { provide: ChatService, useValue: chatServiceMock },
            ],
        });
        service = TestBed.inject(ClassicModeService);
        service.handleSocket();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should init classic mode', () => {
        communicationService = TestBed.inject(CommunicationService);
        const getGameSpy = spyOn(communicationService, 'getGame').and.returnValue(of(gameData));
        const disconnectSpy = spyOn(service, 'disconnectSocket');
        const connectSpy = spyOn(service, 'connect');
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const communicationSocketServiceSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        service.initClassicMode('fakeGame', 'Test', false);
        expect(getGameSpy).toHaveBeenCalled();
        expect(disconnectSpy).toHaveBeenCalled();
        expect(connectSpy).toHaveBeenCalled();
        expect(communicationSocketServiceSpy).toHaveBeenCalledWith('createGame', service.gameRoom);
    });

    it("should alert game is not found after calling 'initClassicMode'", () => {
        communicationService = TestBed.inject(CommunicationService);
        const getGameSpy = spyOn(communicationService, 'getGame').and.returnValue(of(undefined as unknown as GameData));
        const alertSpy = spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        service.initClassicMode('fakeGame', 'Test', false);
        expect(getGameSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Jeu introuvable');
    });

    it('should join classic mode', () => {
        communicationService = TestBed.inject(CommunicationService);
        const getGameSpy = spyOn(communicationService, 'getGame').and.returnValue(of(gameData));
        const disconnectSpy = spyOn(service, 'disconnectSocket');
        const connectSpy = spyOn(service, 'connect');
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const communicationSocketServiceSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        service.joinWaitingRoomClassicModeMulti('fakeGame', 'Test');
        expect(getGameSpy).toHaveBeenCalled();
        expect(disconnectSpy).toHaveBeenCalled();
        expect(connectSpy).toHaveBeenCalled();
        expect(communicationSocketServiceSpy).toHaveBeenCalledWith('askingToJoinGame', ['fakeGame', 'Test']);
    });

    it("should alert game is not found after calling 'initClassicMode'", () => {
        communicationService = TestBed.inject(CommunicationService);
        const getGameSpy = spyOn(communicationService, 'getGame').and.returnValue(of(undefined as unknown as GameData));
        const alertSpy = spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        service.joinWaitingRoomClassicModeMulti('fakeGame', 'Test');
        expect(getGameSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Jeu introuvable');
    });

    it("should send 'rejectPlayer' after calling 'playerRejected'", () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const communicationSocketServiceSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service.gameRoom = gameRoom;
        service.playerRejected('Test');
        expect(communicationSocketServiceSpy).toHaveBeenCalledWith('rejectPlayer', [service.gameRoom.roomId, 'Test']);
    });

    it("should send 'acceptPlayer' after calling 'playerAccepted'", () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const communicationSocketServiceSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service.gameRoom = gameRoom;
        service.playerAccepted('Test');
        expect(communicationSocketServiceSpy).toHaveBeenCalledWith('acceptPlayer', [service.gameRoom.roomId, 'Test']);
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

    it('should handle gameInfo', () => {
        service.gameRoom = undefined as unknown as GameRoom;
        socketHelper.peerSideEmit('gameInfo', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.gameRoom$).toBeTruthy();
    });

    it('should update GameRoom in gameInfo if we have the same username', () => {
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('gameInfo', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.gameRoom$).toBeTruthy();
    });

    it('should alert in gameInfo if we have difficulty retrieving game information', () => {
        const alertSpy = spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        socketHelper.peerSideEmit('gameInfo', undefined as unknown as GameRoom);
        expect(alertSpy).toHaveBeenCalledWith('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
    });

    it('should handle gameCreated and call startGame if started is true', () => {
        gameRoom.started = true;
        service.gameRoom = undefined as unknown as GameRoom;
        spyOn(service, 'startGame').and.callFake(() => {
            return;
        });
        socketHelper.peerSideEmit('gameCreated', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.gameRoom$).toBeTruthy();
        expect(service.startGame).toHaveBeenCalled();
    });

    it("shouldn't call startGame in gameCreated if started is false", () => {
        spyOn(service, 'startGame').and.callFake(() => {
            return;
        });
        socketHelper.peerSideEmit('gameCreated', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.gameRoom$).toBeTruthy();
        expect(service.startGame).not.toHaveBeenCalled();
    });

    it('should alert in gameCreated if we have difficulty retrieving game information', () => {
        const alertSpy = spyOn(window, 'alert').and.callFake(() => {
            return;
        });
        socketHelper.peerSideEmit('gameCreated', undefined as unknown as GameRoom);
        expect(alertSpy).toHaveBeenCalledWith('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
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

    it('should handle playerAccepted', () => {
        service.username = gameRoom.userGame.username1;
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('playerAccepted', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.accepted$).toBeTruthy();
    });

    it("should handle playerAccepted and rejecte player if requirements aren't met", () => {
        service.username = 'differentUsername';
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('playerAccepted', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.rejected$).toBeTruthy();
    });

    it('should handle playerRejected', () => {
        service.username = 'differentUsername';
        socketHelper.peerSideEmit('playerRejected', gameRoom);
        expect(service.rejected$).toBeTruthy();
    });

    it('should handle playerRejected if differents players still in potentielPlayers', () => {
        service.username = 'differentUsername';
        gameRoom.userGame.potentielPlayers = ['myusername', 'anotherDifferentUsername'];
        socketHelper.peerSideEmit('playerRejected', gameRoom);
        expect(service.rejected$).toBeTruthy();
    });

    it("should handle playerRejected if requirements aren't met", () => {
        service.username = gameRoom.userGame.username1;
        socketHelper.peerSideEmit('playerRejected', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
    });

    it('should handle gameCanceled', () => {
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('gameCanceled', gameRoom.userGame.gameData.gameForm.name);
        expect(service.gameCanceled$).toBeTruthy();
    });

    it('should handle gameCanceled if gameRoom is undefined', () => {
        service.gameRoom = undefined as unknown as GameRoom;
        socketHelper.peerSideEmit('gameCanceled', gameRoom.userGame.gameData.gameForm.name);
        expect(service.gameCanceled$).toBeTruthy();
    });

    it('should handle abandoned', () => {
        socketHelper.peerSideEmit('abandoned', 'Test');
        expect(service.abandoned$).toBeTruthy();
    });

    it('should handle on timer message', () => {
        service.gameRoom = gameRoom;
        socketHelper.peerSideEmit('timer', 1);
        expect(service.gameRoom.userGame.timer).toEqual(1);
    });

    it('should start the game call chatService and off of socketService', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spySend = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        const spyOff = spyOn(communicationSocketService, 'off').and.callFake(() => {
            return;
        });
        const spyChat = spyOn(chatServiceMock, 'handleSocket');
        service.username = gameRoom.userGame.username1;
        service.gameRoom = gameRoom;
        service.startGame();
        expect(spySend).toHaveBeenCalledWith('start', gameRoom.roomId);
        expect(spyChat).toHaveBeenCalled();
        expect(spyOff).toHaveBeenCalledWith('gameInfo');
        expect(spyOff).toHaveBeenCalledWith('gameCreated');
        expect(spyOff).toHaveBeenCalledWith('playerAccepted');
        expect(spyOff).toHaveBeenCalledWith('playerRejected');
        expect(spyOff).toHaveBeenCalledWith('gameCanceled');
    });

    it('should validate the difference', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        expect(service.canSendValidate).toBeTruthy();
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        service.gameRoom = gameRoom;
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

    it('should end the game', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        const spy2 = spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service.gameRoom = gameRoom;
        service.endGame();
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should abandon the game', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const sendSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service.gameRoom = gameRoom;
        service.username = gameRoom.userGame.username1;
        service.abandonGame();
        expect(sendSpy).toHaveBeenCalledWith('abandoned', [service.gameRoom.roomId, service.username]);
    });

    it('should abort the game creation', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const sendSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        spyOn(service, 'disconnectSocket').and.callFake(() => {
            return;
        });
        service.gameRoom = gameRoom;
        service.username = gameRoom.userGame.username1;
        service.abortGame();
        expect(sendSpy).toHaveBeenCalledWith('abortGameCreation', service.gameRoom.roomId);
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should leave game', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const sendSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        spyOn(service, 'disconnectSocket').and.callFake(() => {
            return;
        });
        service.gameRoom = gameRoom;
        service.username = 'differentUsername';
        service.abortGame();
        expect(sendSpy).toHaveBeenCalledWith('leaveGame', [service.gameRoom.roomId, service.username]);
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should leave game if gameRoom is undefined', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const sendSpy = spyOn(communicationSocketService, 'send').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        spyOn(service, 'disconnectSocket').and.callFake(() => {
            return;
        });
        service.gameRoom = undefined as unknown as GameRoom;
        service.username = 'differentUsername';
        service.abortGame();
        expect(sendSpy).not.toHaveBeenCalled();
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should disconnect socket', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'disconnect').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service.disconnectSocket();
        expect(spy).toHaveBeenCalled();
    });

    it('should not disconnect socket', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'disconnect').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return false;
        });
        service.disconnectSocket();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should connect to socket', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'connect').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return false;
        });
        service.connectSocket();
        expect(spy).toHaveBeenCalled();
    });

    it('should not connect to socket', () => {
        communicationSocketService = TestBed.inject(CommunicationSocketService);
        const spy = spyOn(communicationSocketService, 'connect').and.callFake(() => {
            return;
        });
        spyOn(communicationSocketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service.connectSocket();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should reset', () => {
        service.gameRoom = gameRoom;
        service.reset();
        expect(service.gameRoom).toBeUndefined();
        expect(service.canSendValidate).toBeTruthy();
        expect(service.username).toEqual('');
        expect(service.userDifferencesFound).toEqual(0);
    });
});
