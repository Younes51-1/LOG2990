// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { PageKeys, options } from 'src/assets/variables/game-card-options';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';

@NgModule({
    imports: [HttpClientModule],
})
export class DynamicTestModule {}

class SocketClientServiceMock extends CommunicationSocketService {
    override connect() {
        return;
    }
}

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [AppRoutingModule, DynamicTestModule, RouterTestingModule],
            providers: [ClassicModeService, CommunicationSocketService, { provide: CommunicationSocketService, useValue: socketServiceMock }],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.page = PageKeys.Config;
        component.slide = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulte: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
                { name: 'player3', time: 150 },
            ],
            vsBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
                { name: 'player3', time: 150 },
            ],
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('slide should have name', () => {
        expect(component.slide.name).toBeTruthy();
    });

    it('should have game image', () => {
        const image = fixture.debugElement.nativeElement.querySelector('img');
        expect(image.src).toEqual('https://example.com/image1.jpg');
    });

    it('slide should have difficulte', () => {
        expect(component.slide.difficulte).toBeTruthy();
    });

    it('should have three best solo scores', () => {
        expect(component.slide.soloBestTimes.length).toEqual(3);
    });

    it('should have three best 1v1 scores', () => {
        expect(component.slide.vsBestTimes.length).toEqual(3);
    });

    it('should have play button for solo mode', () => {
        const btn1 = fixture.debugElement.nativeElement.getElementsByTagName('button')[0];
        expect(btn1).not.toBeUndefined();
    });

    it('should have create/join button for 1v1 mode', () => {
        const btn2 = fixture.debugElement.nativeElement.getElementsByTagName('button')[1];
        expect(btn2).not.toBeUndefined();
    });

    it('should emit the correct value when startSoloGame is called', () => {
        const spy = spyOn(component.notify, 'emit');
        component.startSoloGame();
        expect(spy).toHaveBeenCalledWith(component.slide.name);
    });

    it('should emit the correct object when createGame is called', () => {
        const spy = spyOn(component.notify, 'emit');
        component.createGame();
        expect(spy).toHaveBeenCalledWith(component.slide);
    });

    it('should set the correct properties when the page is Config', () => {
        component.ngOnInit();
        expect(component.routeOne).toEqual(options.config.routeOne);
        expect(component.btnOne).toEqual(options.config.btnOne);
        expect(component.routeTwo).toEqual(options.config.routeTwo);
        expect(component.btnTwo).toEqual(options.config.btnTwo);
    });

    it('should set the correct properties when the page is Selection', () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        expect(component.routeOne).toEqual(options.selection.routeOne);
        expect(component.btnOne).toEqual(options.selection.btnOne);
        expect(component.routeTwo).toEqual(options.selection.routeTwo);
        expect(component.btnTwo).toEqual(options.selection.btnTwo);
    });

    it("should call 'initClassicMode' by startSoloGame if page is Selection", () => {
        const spy = spyOn(component.classicModeService, 'initClassicMode');
        component.page = PageKeys.Selection;
        component.ngOnInit();
        component.startSoloGame();
        expect(spy).toHaveBeenCalled();
    });

    it("shouldn't call 'initClassicMode' by startSoloGame if page isn't Selection", () => {
        const spy = spyOn(component.classicModeService, 'initClassicMode');
        component.startSoloGame();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should toggle the border if inputValue1 is incorrect', () => {
        component.inputValue1 = '';
        component.applyBorder = false;
        component.verifySoloInput();
        expect(component.applyBorder).toBe(true);
    });

    it('should call startSoloGame and navigate to routeOne if inputValue1 is correct', () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        spyOn(component, 'startSoloGame');
        component.inputValue1 = 'test';
        component.verifySoloInput();

        expect(component.startSoloGame).toHaveBeenCalled();
    });
});
