// /* eslint-disable max-classes-per-file */
// import { HttpClientModule } from '@angular/common/http';
// import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { RouterTestingModule } from '@angular/router/testing';
// import { SocketTestHelper } from '@app/classes/socket-test-helper';
// import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
// import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
// import { Socket } from 'socket.io-client';
// import { WaitingRoomComponent } from './waiting-room-dialog.component';

// @NgModule({
//     imports: [HttpClientModule, MatDialogModule],
// })
// export class DynamicTestModule {}
// class SocketClientServiceMock extends CommunicationSocketService {
//     override connect() {
//         return;
//     }
// }

// describe('WaitingPageComponent', () => {
//     let component: WaitingRoomComponent;
//     let fixture: ComponentFixture<WaitingRoomComponent>;
//     let socketServiceMock: SocketClientServiceMock;
//     let socketHelper: SocketTestHelper;

//     beforeEach(async () => {
//         jasmine.createSpyObj('ClassicModeService', ['rejected$', 'accepted$', 'gameCanceled$']);
//         socketHelper = new SocketTestHelper();
//         socketServiceMock = new SocketClientServiceMock();
//         socketServiceMock.socket = socketHelper as unknown as Socket;
//         await TestBed.configureTestingModule({
//             declarations: [WaitingRoomComponent],
//             imports: [DynamicTestModule, RouterTestingModule],
//             providers: [ClassicModeService, { provide: CommunicationSocketService, useValue: socketServiceMock }, { provide: MatDialogRef }],
//             schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(WaitingRoomComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
