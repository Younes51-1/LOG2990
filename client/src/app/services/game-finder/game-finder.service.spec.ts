/* eslint-disable max-classes-per-file */
import { TestBed } from '@angular/core/testing';

import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { GameFinderService } from '@app/services/game-finder/game-finder.service';
import { Socket } from 'socket.io-client';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('GameFinderService', () => {
    let service: GameFinderService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let gameCardComponent: GameCardComponent;
    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socketServiceMock as any).socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [AppRoutingModule, DynamicTestModule, RouterTestingModule, HttpClientTestingModule],
            providers: [GameCardComponent, { provide: CommunicationSocketService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(GameFinderService);
        gameCardComponent = TestBed.inject(GameCardComponent);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('check game should connect socket and send checkGame event', () => {
        const connectSpy = spyOn(socketServiceMock, 'connect').and.stub();
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        service.gameMode = 'mode Temps Limité';
        service.checkGame();
        expect(connectSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith('checkGame', { gameName: undefined, gameMode: 'mode Temps Limité' });
    });

    it('check game should handle gameFound event for mode Temps Limité', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next').and.stub();
        service.gameMode = 'mode Temps Limité';
        service.checkGame();
        socketHelper.peerSideEmit('gameFound', { gameName: undefined, gameMode: 'mode Temps Limité' });
        expect(gameExistsSpy).toHaveBeenCalledWith(true);
    });

    it('check game should handle gameFound event for mode Temps Limité', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next').and.stub();
        service.gameMode = 'mode Classique';
        service.checkGame('test');
        socketHelper.peerSideEmit('gameFound', { gameName: 'test', gameMode: 'mode Classique' });
        expect(gameExistsSpy).toHaveBeenCalledWith(true);
    });

    it('check game should handle gameDeleted event for mode Temps Limité', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next').and.stub();
        service.gameMode = 'mode Temps Limité';
        service.checkGame();
        socketHelper.peerSideEmit('gameDeleted', { gameName: undefined, gameMode: 'mode Temps Limité' });
        expect(gameExistsSpy).toHaveBeenCalledWith(false);
    });

    it('check game should handle gameDeleted event for mode Temps Limité', () => {
        const gameExistsSpy = spyOn(service.gameExists$, 'next').and.stub();
        service.gameMode = 'mode Classique';
        service.checkGame('test');
        socketHelper.peerSideEmit('gameDeleted', { gameName: 'test', gameMode: 'mode Classique' });
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

    it('canJoinGame should send canJoinGame event', () => {
        const sendSpy = spyOn(socketServiceMock, 'send').and.stub();
        service.canJoinGame('username', gameCardComponent);
        expect(sendSpy).toHaveBeenCalledWith('canJoinGame', { gameName: undefined, username: 'username', gameMode: undefined });
    });

    it('should handle canJoinGame event', () => {
        const canJoinGameSpy = spyOn(gameCardComponent, 'joinGame').and.stub();
        service.canJoinGame('username', gameCardComponent);
        socketHelper.peerSideEmit('canJoinGame');
        expect(canJoinGameSpy).toHaveBeenCalled();
    });

    it('should handle cannotJoinGame event', () => {
        const disconnectSocketSpy = spyOn(service, 'disconnectSocket').and.stub();
        service.canJoinGame('username', gameCardComponent);
        socketHelper.peerSideEmit('cannotJoinGame');
        expect(disconnectSocketSpy).toHaveBeenCalled();
        expect(gameCardComponent.applyBorder).toBeTruthy();
    });
});
