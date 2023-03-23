/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChatService } from '@app/services/chat/chat.service';
import { HelpService } from '@app/services/help/help.service';

describe('HelpService', () => {
    let service: HelpService;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let component: PlayAreaComponent;
    let chatService: ChatService;
    const differenceMatrix: number[][] = [[]];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [BrowserModule, CommonModule, HttpClientTestingModule],
        });
        service = TestBed.inject(HelpService);
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        (service as any).component = component;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set variables and call cheatMode on press of T', () => {
        const cheatModeSpy = spyOn(service as any, 'cheatMode');
        const cheatModeKey = 't';
        const buttonEvent = { key: cheatModeKey } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect((service as any).isCheatModeOn).toBeTrue();
        expect(cheatModeSpy).toHaveBeenCalled();
    });

    it('should not call cheatMode if player is typing', () => {
        chatService = TestBed.inject(ChatService);
        spyOn(chatService, 'getIsTyping').and.returnValue(true);
        const cheatModeSpy = spyOn(service as any, 'cheatMode');
        const cheatModeKey = 't';
        const buttonEvent = { key: cheatModeKey } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(cheatModeSpy).not.toHaveBeenCalled();
    });

    it("shouldn't call createAndFillNewLayer when in cheatMode if context1 or context2 are null", fakeAsync(() => {
        (component as any).context1 = null as unknown as CanvasRenderingContext2D;
        (component as any).context2 = null as unknown as CanvasRenderingContext2D;
        const spy = spyOn(component as any, 'createAndFillNewLayer').and.callFake(() => {
            return null as unknown as HTMLCanvasElement;
        });
        (service as any).isCheatModeOn = true;
        (service as any).cheatMode();
        const ms = 125;
        tick(ms);
        expect(spy).not.toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should call drawImage 8 times per second on both contexts when in cheatMode', fakeAsync(() => {
        (component as any).differenceMatrix = differenceMatrix;
        (service as any).isCheatModeOn = true;
        (component as any).context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        (component as any).context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const drawImageSpy1 = spyOn((component as any).context1, 'drawImage');
        const drawImageSpy2 = spyOn((component as any).context2, 'drawImage');
        (service as any).cheatMode();
        const ms = 1000;
        tick(ms);
        const timesCalled = 8;
        expect(drawImageSpy1).toHaveBeenCalledTimes(timesCalled);
        expect(drawImageSpy2).toHaveBeenCalledTimes(timesCalled);
        discardPeriodicTasks();
    }));

    it('should clearInterval if cheatMode is deactivated', () => {
        (service as any).isCheatModeOn = false;
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        (service as any).cheatMode();
        expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear flashes from canvases if cheatMode is deactivated', () => {
        (service as any).isCheatModeOn = false;
        const context1Spy = spyOn((component as any).context1, 'drawImage');
        const context2Spy = spyOn((component as any).context2, 'drawImage');
        (service as any).cheatMode();
        expect(context1Spy).toHaveBeenCalledTimes(1);
        expect(context2Spy).toHaveBeenCalledTimes(1);
    });

    it('should call createAndFillNewLayer when in cheatMode', fakeAsync(() => {
        const canvasMock = document.createElement('canvas');
        const canvasContextMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);
        canvasMock.getContext = jasmine.createSpy('getContext').and.returnValue(canvasContextMock);
        const spy = spyOn(component as any, 'createAndFillNewLayer').and.returnValue(canvasMock);
        (service as any).isCheatModeOn = true;
        (component as any).differenceMatrix = differenceMatrix;
        (service as any).cheatMode();
        const ms = 125;
        tick(ms);
        expect(spy).toHaveBeenCalledTimes(1);
        discardPeriodicTasks();
    }));
});
