/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ReplayPlayAreaComponent } from '@app/components/replay-components/replay-play-area/replay-play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

describe('PlayAreaService', () => {
    let service: PlayAreaService;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let component: PlayAreaComponent;
    let replayComponent: ReplayPlayAreaComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, AppRoutingModule, DynamicTestModule],
            providers: [PlayAreaService, PlayAreaComponent, ReplayPlayAreaComponent],
        });
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        replayComponent = TestBed.inject(ReplayPlayAreaComponent);
        service = TestBed.inject(PlayAreaService);
        fixture.detectChanges();
        component.ngAfterViewInit();
        replayComponent.ngAfterViewInit();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set playAreaComponent', () => {
        service.setComponent(component, false);
        expect((service as any).component).toEqual(component);
        expect((service as any).replay).toBeFalsy();
        expect((service as any).normalComponent).toEqual(component);
    });

    it('should set ReplayPlayAreaComponent', () => {
        service.setComponent(replayComponent, true);
        expect((service as any).component).toEqual(replayComponent);
        expect((service as any).replay).toBeTruthy();
        expect((service as any).replayComponent).toEqual(replayComponent);
    });

    it('should setCheatMode', () => {
        service.setCheatMode();
        expect((service as any).isCheatModeOn).toBeFalsy();
    });

    it('should set speed', () => {
        service.setSpeed(1);
        expect((service as any).speed).toEqual(1);
    });

    it('should clearAsync', () => {
        spyOn(window, 'clearInterval').and.stub();
        service.clearAsync();
        expect(window.clearInterval).toHaveBeenCalled();
    });

    it('should start confetti without coordinates', fakeAsync(() => {
        service.setComponent(component, false);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        spyOn(Math, 'random').and.returnValue(0.5);
        spyOn(window, 'setTimeout').and.callThrough();
        spyOn(window, 'setInterval').and.callThrough();
        service.setSpeed(1);
        service.startConfetti(undefined);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        tick(15000);
        expect((service as any).intervalId).toBeDefined();
        expect(window.setInterval).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should create a canvas element when given coordinates', (done) => {
        const canvas = document.createElement('canvas');
        spyOn(canvas, 'getContext').and.callThrough();
        spyOn(document, 'createElement').and.returnValue(canvas);
        service.startConfetti({ x: 100, y: 200 });
        setTimeout(() => {
            // eslint-disable-next-line deprecation/deprecation
            expect(document.createElement).toHaveBeenCalledWith('canvas');
            expect(canvas.getContext).toHaveBeenCalledWith('2d');
            done();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1000);
    });

    it('should not start cheat mode if component contexts are not set', () => {
        spyOn(service, 'endCheatMode');
        (service as any).component.context1 = null;
        (service as any).component.context2 = null;
        service.cheatMode();
        expect(service.endCheatMode).not.toHaveBeenCalled();
    });

    it('should end cheat mode if cheat mode is not on', () => {
        spyOn(service, 'endCheatMode');
        service.isCheatModeOn = false;
        service.cheatMode();
        expect(service.endCheatMode).toHaveBeenCalled();
    });

    it('should emit sendCheatEnd event if cheat mode is not on and replay is not set', () => {
        spyOn((service as any).normalComponent.sendCheatEnd, 'emit');
        service.isCheatModeOn = false;
        (service as any).replay = false;
        service.cheatMode();
        expect((service as any).normalComponent.sendCheatEnd.emit).toHaveBeenCalled();
    });

    it('should start cheat mode if cheat mode is on', () => {
        spyOn(service, 'startCheatMode');
        service.isCheatModeOn = true;
        service.cheatMode();
        expect(service.startCheatMode).toHaveBeenCalled();
    });

    it('should do nothing if replay is true', () => {
        spyOn(service, 'startConfetti');
        spyOn(service as any, 'playNormalHint');
        (service as any).replay = true;
        service.hintMode(1);
        expect(service.startConfetti).not.toHaveBeenCalled();
        expect((service as any).playNormalHint).not.toHaveBeenCalled();
    });

    it('should call startConfetti and sendHint with hintNum 2 if diffCoords is found and hintNum is 2', () => {
        spyOn(service, 'startConfetti');
        spyOn(service as any, 'playNormalHint');
        spyOn((service as any).normalComponent.sendHint, 'emit');
        spyOn((service as any).normalComponent, 'verifyDifferenceMatrix');
        (service as any).normalComponent.differenceMatrix = [[]];
        spyOn((service as any).detectionDifferenceService, 'findRandomDifference').and.returnValue({ x: 10, y: 20 });
        service.hintMode(2);
        expect(service.startConfetti).toHaveBeenCalledWith({ x: 10, y: 20 });
        expect((service as any).normalComponent.sendHint.emit).toHaveBeenCalledWith({
            hintNum: 2,
            diffPos: { x: 10, y: 20 },
            layer: (service as any).normalComponent.layer,
        });
        expect((service as any).normalComponent.verifyDifferenceMatrix).not.toHaveBeenCalled();
        expect((service as any).playNormalHint).not.toHaveBeenCalled();
    });

    it('should call verifyDifferenceMatrix with the dial choice and sendHint with the hintNum and diffCoords if hintNum is not 2', () => {
        spyOn(service, 'startConfetti');
        spyOn(service as any, 'playNormalHint');
        spyOn((service as any).normalComponent.sendHint, 'emit');
        spyOn((service as any).normalComponent, 'verifyDifferenceMatrix');
        (service as any).normalComponent.differenceMatrix = [[]];
        spyOn((service as any).detectionDifferenceService, 'findRandomDifference').and.returnValue({ x: 10, y: 20 });
        spyOn(service as any, 'chooseDial').and.returnValue('c');
        service.hintMode(1);
        expect(service.startConfetti).not.toHaveBeenCalled();
        expect((service as any).normalComponent.sendHint.emit).toHaveBeenCalledWith({
            hintNum: 1,
            diffPos: { x: 10, y: 20 },
            layer: (service as any).normalComponent.layer,
        });
        expect((service as any).normalComponent.verifyDifferenceMatrix).toHaveBeenCalledWith('hint', 'c');
        expect((service as any).playNormalHint).toHaveBeenCalled();
    });

    it('should call startConfetti if hintNum is 2', () => {
        spyOn(service, 'startConfetti');
        const canvas = document.createElement('canvas');
        service.playHint(2, canvas, { x: 10, y: 20 });
        expect(service.startConfetti).toHaveBeenCalledWith({ x: 10, y: 20 });
    });

    it('should call playNormalHint if hintNum is not 2', () => {
        spyOn(service as any, 'playNormalHint');
        const canvas = document.createElement('canvas');
        service.playHint(1, canvas, { x: 10, y: 20 });
        expect((service as any).playNormalHint).toHaveBeenCalledWith(canvas);
    });

    it('should clear interval and update contexts', () => {
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.stub();
        service.endCheatMode();
        expect(clearIntervalSpy).toHaveBeenCalledWith((service as any).cheatInterval);
        expect(updateContextsSpy).toHaveBeenCalled();
    });

    it('should set replayCheatOn to false in replay', () => {
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.stub();
        (service as any).replay = true;
        (service as any).replayCheatOn = true;
        service.endCheatMode();
        expect(clearIntervalSpy).toHaveBeenCalledWith((service as any).cheatInterval);
        expect(updateContextsSpy).toHaveBeenCalled();
        expect((service as any).replayCheatOn).toBeFalse();
    });

    // TODO: test startCheatMode

    it('should set context1 and context2 to canvas contexts', () => {
        const context = document.createElement('canvas').getContext('2d');
        spyOn((service as any).component.canvas1.nativeElement, 'getContext').and.returnValue(context);
        spyOn((service as any).component.canvas2.nativeElement, 'getContext').and.returnValue(context);
        service.setContexts();
        expect(component.context1).toBe(context as CanvasRenderingContext2D);
        expect(component.context2).toBe(context as CanvasRenderingContext2D);
    });

    it('should not set context1 and context2 if canvas contexts are null', () => {
        (service as any).component.context1 = null;
        (service as any).component.context2 = null;
        spyOn((service as any).component.canvas1.nativeElement, 'getContext').and.returnValue(null);
        spyOn((service as any).component.canvas2.nativeElement, 'getContext').and.returnValue(null);
        service.setContexts();
        expect((service as any).component.context1).toBeNull();
        expect((service as any).component.context2).toBeNull();
    });

    // TODO: test flashDifference
});
