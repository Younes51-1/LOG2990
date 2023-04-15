/* eslint-disable max-classes-per-file */
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameData, GameRoom } from '@app/interfaces/game';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { Socket } from 'socket.io-client';
import { WaitingRoomService } from './waiting-room.service';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('WaitingRoomService', () => {
    let differenceMatrix: number[][];
    let gameData: GameData;
    let gameRoom: GameRoom;

    let service: WaitingRoomService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        differenceMatrix = [[]];
        gameData = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulty: '', soloBestTimes: [], vsBestTimes: [], differenceMatrix };
        gameRoom = {
            userGame: { gameData, nbDifferenceFound: 0, timer: 0, username1: 'Test' },
            roomId: 'fakeId',
            started: false,
            gameMode: 'mode classique',
        };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socketServiceMock as any).socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, AppRoutingModule, DynamicTestModule],
            providers: [{ provide: CommunicationSocketService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(WaitingRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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

    it("should send 'rejectPlayer' after calling 'playerRejected'", () => {
        spyOn(socketServiceMock, 'send').and.stub();
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        service.gameRoom = gameRoom;
        service.playerRejected('Test');
        expect(socketServiceMock.send).toHaveBeenCalledWith('rejectPlayer', { roomId: service.gameRoom.roomId, username: 'Test' });
    });

    it("should send 'acceptPlayer' after calling 'playerAccepted'", () => {
        spyOn(socketServiceMock, 'send').and.stub();
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        service.gameRoom = gameRoom;
        service.playerAccepted('Test');
        expect(socketServiceMock.send).toHaveBeenCalledWith('acceptPlayer', { roomId: service.gameRoom.roomId, username: 'Test' });
    });

    it('should abort the game creation', () => {
        spyOn(socketServiceMock, 'send').and.stub();
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        spyOn(service, 'disconnectSocket').and.stub();
        service.gameRoom = gameRoom;
        service.username = gameRoom.userGame.username1;
        service.abortGame();
        expect(socketServiceMock.send).toHaveBeenCalledWith('abortGameCreation', service.gameRoom.roomId);
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should leave game', () => {
        spyOn(socketServiceMock, 'send').and.stub();
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        spyOn(service, 'disconnectSocket').and.stub();
        service.gameRoom = gameRoom;
        service.username = 'differentUsername';
        service.abortGame();
        expect(socketServiceMock.send).toHaveBeenCalledWith('leaveGame', { roomId: service.gameRoom.roomId, username: service.username });
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should leave game if gameRoom is undefined', () => {
        spyOn(socketServiceMock, 'send').and.stub();
        spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
        spyOn(service, 'disconnectSocket').and.stub();
        service.gameRoom = undefined as unknown as GameRoom;
        service.username = 'differentUsername';
        service.gameMode = 'mode classique';
        service.abortGame();
        expect(socketServiceMock.send).not.toHaveBeenCalled();
        expect(service.disconnectSocket).toHaveBeenCalled();
    });

    it('should start game', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn((service as any).gameService, 'startGame').and.stub();
        service.gameRoom = gameRoom;
        service.username = gameRoom.userGame.username1;
        service.startGame();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).gameService.startGame).toHaveBeenCalled();
    });

    it('should create game', () => {
        spyOn(service, 'disconnectSocket').and.stub();
        spyOn(service, 'connectSocket').and.stub();
        spyOn(service, 'handleWaitingRoomSocket').and.stub();
        spyOn(socketServiceMock, 'send').and.stub();
        service.createGame(gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.username).toEqual(gameRoom.userGame.username1);
        expect(service.gameMode).toEqual(gameRoom.gameMode);
        expect(service.disconnectSocket).toHaveBeenCalled();
        expect(service.connectSocket).toHaveBeenCalled();
        expect(service.handleWaitingRoomSocket).toHaveBeenCalled();
        expect(socketServiceMock.send).toHaveBeenCalledWith('createGame', gameRoom);
    });

    it('should join game', () => {
        spyOn(service, 'disconnectSocket').and.stub();
        spyOn(service, 'connectSocket').and.stub();
        spyOn(service, 'handleWaitingRoomSocket').and.stub();
        spyOn(socketServiceMock, 'send').and.stub();
        service.joinGame('test', 'mode classique');
        expect(service.gameRoom).toBeUndefined();
        expect(service.username).toEqual('test');
        expect(service.gameMode).toEqual('mode classique');
        expect(service.disconnectSocket).toHaveBeenCalled();
        expect(service.connectSocket).toHaveBeenCalled();
        expect(service.handleWaitingRoomSocket).toHaveBeenCalled();
        expect(socketServiceMock.send).toHaveBeenCalledWith('askingToJoinGame', {
            gameName: undefined,
            username: 'test',
            gameMode: 'mode classique',
        });
    });

    it('should handle gameInfo', () => {
        service.gameRoom = undefined as unknown as GameRoom;
        service.gameMode = 'mode classique';
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameInfo', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
    });

    it('should update GameRoom in gameInfo if we have the same username', () => {
        service.gameRoom = gameRoom;
        service.gameMode = 'mode classique';
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameInfo', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
    });

    it('should alert in gameInfo if we have difficulty retrieving game information', () => {
        const alertSpy = spyOn(window, 'alert').and.stub();
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameInfo', undefined as unknown as GameRoom);
        expect(alertSpy).toHaveBeenCalledWith('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
    });

    it('should handle gameCreated and call startGame if started is true', () => {
        service.gameRoom = gameRoom;
        service.gameRoom.roomId = '';
        service.gameRoom.started = true;
        service.gameMode = 'mode classique';
        spyOn(service, 'startGame').and.stub();
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCreated', 'fakeId');
        expect(service.gameRoom.roomId).toEqual('fakeId');
        expect(service.startGame).toHaveBeenCalled();
    });

    it("shouldn't call startGame in gameCreated if started is false", () => {
        service.gameRoom = gameRoom;
        service.gameRoom.roomId = '';
        service.gameRoom.started = false;
        service.gameMode = 'mode classique';
        spyOn(service, 'startGame').and.stub();
        service.gameMode = 'mode classique';
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCreated', 'fakeId');
        expect(service.gameRoom.roomId).toEqual('fakeId');
        expect(service.startGame).not.toHaveBeenCalled();
    });

    it('should alert in gameCreated if we have difficulty retrieving game information', () => {
        const alertSpy = spyOn(window, 'alert').and.stub();
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCreated', undefined as unknown as GameRoom);
        expect(alertSpy).toHaveBeenCalledWith('Nous avons eu un problème pour obtenir les informations de jeu du serveur');
    });

    it('should handle playerAccepted', () => {
        spyOn(service.accepted$, 'next').and.stub();
        service.username = gameRoom.userGame.username1;
        service.gameRoom = gameRoom;
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('playerAccepted', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.accepted$.next).toHaveBeenCalled();
    });

    it("should handle playerAccepted and rejecte player if requirements aren't met", () => {
        spyOn(service.accepted$, 'next').and.stub();
        spyOn(service.rejected$, 'next').and.stub();
        service.username = 'differentUsername';
        service.gameRoom = gameRoom;
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('playerAccepted', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
        expect(service.accepted$.next).not.toHaveBeenCalled();
        expect(service.rejected$.next).toHaveBeenCalled();
    });

    it('should handle playerRejected', () => {
        spyOn(service.rejected$, 'next').and.stub();
        service.username = 'differentUsername';
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('playerRejected', gameRoom);
        expect(service.rejected$.next).toHaveBeenCalled();
    });

    it('should handle playerRejected if differents players still in potentialPlayers', () => {
        spyOn(service.rejected$, 'next').and.stub();
        service.username = 'differentUsername';
        gameRoom.userGame.potentialPlayers = ['myusername', 'anotherDifferentUsername'];
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('playerRejected', gameRoom);
        expect(service.rejected$.next).toHaveBeenCalled();
    });

    it("should handle playerRejected if requirements aren't met", () => {
        service.username = gameRoom.userGame.username1;
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('playerRejected', gameRoom);
        expect(service.gameRoom).toEqual(gameRoom);
    });

    it('should handle gameCanceled', () => {
        spyOn(service.gameCanceled$, 'next').and.stub();
        service.gameRoom = gameRoom;
        service.gameMode = 'mode classique';
        service.username = gameRoom.userGame.username1;
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCanceled', gameRoom);
        expect(service.gameCanceled$.next).toHaveBeenCalled();
    });

    it('should handle gameCanceled if gameRoom is undefined', () => {
        spyOn(service.gameCanceled$, 'next').and.stub();
        service.gameRoom = undefined as unknown as GameRoom;
        service.gameMode = 'mode classique';
        service.username = gameRoom.userGame.username1;
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCanceled', gameRoom);
        expect(service.gameCanceled$.next).not.toHaveBeenCalled();
    });

    it('should handle gameCanceled send undefined', () => {
        spyOn(service.gameCanceled$, 'next').and.stub();
        service.gameRoom = gameRoom;
        service.gameMode = 'mode classique';
        service.username = gameRoom.userGame.username1;
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCanceled', undefined as unknown as GameRoom);
        expect(service.gameCanceled$.next).not.toHaveBeenCalled();
    });

    it('should handle gameCanceled for potentiel users', () => {
        spyOn(service.gameCanceled$, 'next').and.stub();
        gameRoom.userGame.potentialPlayers = ['myusername', 'differentUsername'];
        service.gameRoom = gameRoom;
        service.gameMode = 'mode classique';
        service.username = 'differentUsername';
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCanceled', gameRoom);
        expect(service.gameCanceled$.next).toHaveBeenCalled();
    });

    it('should handle gameCanceled if it was sent to wrong user', () => {
        spyOn(service.gameCanceled$, 'next').and.stub();
        service.gameRoom = gameRoom;
        service.gameMode = 'mode classique';
        service.username = 'differentUsername';
        service.handleWaitingRoomSocket();
        socketHelper.peerSideEmit('gameCanceled', gameRoom);
        expect(service.gameCanceled$.next).not.toHaveBeenCalled();
    });
});
