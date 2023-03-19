/* eslint-disable @typescript-eslint/no-explicit-any */
// We need it to access private methods and properties in the test
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { of } from 'rxjs';
import { WaitingRoomComponent } from './waiting-room-dialog.component';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let classicModeServiceSpy: ClassicModeService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            providers: [ClassicModeService, { provide: MatDialogRef, useValue: {} }],
            imports: [AppRoutingModule, HttpClientTestingModule],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the rejected property when rejected$ event is triggered', () => {
        fixture.detectChanges();
        classicModeServiceSpy.rejected$.next(true);

        expect(component.rejected).toBe(true);
    });

    it('should start the game and navigate to /game when accepted$ event is triggered', () => {
        spyOn(classicModeServiceSpy, 'startGame');
        spyOn((component as any).router, 'navigate');

        fixture.detectChanges();
        classicModeServiceSpy.accepted$.next(true);

        expect(component.accepted).toBe(true);
        expect(classicModeServiceSpy.startGame).toHaveBeenCalled();
        expect((component as any).router.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('should display an alert, abort the game and close the component when gameCanceled$ event is triggered', () => {
        spyOn(component, 'close');
        spyOn(classicModeServiceSpy, 'abortGame');
        spyOn(window, 'alert');

        fixture.detectChanges();
        component.gameCanceled = false;
        classicModeServiceSpy.gameCanceled$.next(true);

        expect(window.alert).toHaveBeenCalledWith('Game canceled');
        expect(classicModeServiceSpy.abortGame).toHaveBeenCalled();
        expect(component.close).toHaveBeenCalled();
    });

    it('should call classicModeService.playerAccepted with the given player', () => {
        spyOn(classicModeServiceSpy, 'playerAccepted');
        const player = 'ABC';
        component.playerAccepted(player);
        expect(classicModeServiceSpy.playerAccepted).toHaveBeenCalledWith(player);
    });

    it('should call classicModeService.playerRejected with the given player', () => {
        spyOn(classicModeServiceSpy, 'playerRejected');
        const player = 'ABC';
        component.playerRejected(player);
        expect(classicModeServiceSpy.playerRejected).toHaveBeenCalledWith(player);
    });

    it('should unsubscribe from all subscriptions and close the dialog', () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        (component as any).dialogRef = dialogRefSpy;
        const acceptedSubscription = of(null).subscribe();
        const rejectedSubscription = of(null).subscribe();
        const gameCanceledSubscription = of(null).subscribe();
        component.acceptedSubscription = acceptedSubscription;
        component.rejectedSubscription = rejectedSubscription;
        component.gameCanceledSubscription = gameCanceledSubscription;

        component.close();

        expect(acceptedSubscription.closed).toBeTrue();
        expect(rejectedSubscription.closed).toBeTrue();
        expect(gameCanceledSubscription.closed).toBeTrue();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
