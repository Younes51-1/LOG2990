/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { Socket } from 'socket.io-client';
import { WaitingPageComponent } from './waiting-page.component';

@NgModule({
    imports: [HttpClientModule],
})
export class DynamicTestModule {}
class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('WaitingPageComponent', () => {
    let component: WaitingPageComponent;
    let fixture: ComponentFixture<WaitingPageComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        jasmine.createSpyObj('ClassicModeService', ['rejected$', 'accepted$', 'gameCanceled$']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            declarations: [WaitingPageComponent],
            imports: [DynamicTestModule, RouterTestingModule],
            providers: [ClassicModeService, { provide: CommunicationSocketService, useValue: socketServiceMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
