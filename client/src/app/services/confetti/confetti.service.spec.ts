/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { ConfettiService } from '@app/services/confetti/confetti.service';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

describe('ConfettiService', () => {
    let service: ConfettiService;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let component: PlayAreaComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, AppRoutingModule, DynamicTestModule],
            providers: [ConfettiService, PlayAreaService],
        });
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        service = TestBed.inject(ConfettiService);
        const playAreaService = TestBed.inject(PlayAreaService);
        (service as any).playAreaService = playAreaService;
        (service as any).playAreaService.setComponent(component);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set playAreaService', () => {
        const playAreaService = TestBed.inject(PlayAreaService);
        service.setService(playAreaService);
        expect((service as any).playAreaService).toBe(playAreaService);
    });

    it('should start confetti without coordinates', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        spyOn(Math, 'random').and.returnValue(0.5);
        spyOn(window, 'setTimeout').and.callThrough();
        spyOn(window, 'setInterval').and.callThrough();
        (service as any).playAreaService.setSpeed(1);
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
});
