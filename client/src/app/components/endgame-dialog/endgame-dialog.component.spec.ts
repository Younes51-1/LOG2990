/* eslint-disable @typescript-eslint/no-explicit-any */
// We need it to access private methods and properties in the test
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';

const NOT_TOP3 = -1;

describe('EndgameDialogComponent', () => {
    let component: EndgameDialogComponent;
    let fixture: ComponentFixture<EndgameDialogComponent>;
    let configHttpService: jasmine.SpyObj<ConfigHttpService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndgameDialogComponent],
            imports: [AppRoutingModule, HttpClientTestingModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: { gameFinished: true, gameWinner: true, time: 0 } },
                { provide: ConfigHttpService, useValue: configHttpService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EndgameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should set time and timePosition if new best time is set', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        component.data = { gameFinished: true, gameWinner: true, time: 100 };
        component.ngOnInit();
        expect(component.time).toEqual('1:40');
        component.classicModeService.timePosition$.next(0);
        expect(component.timePosition).toEqual('1er');
        expect(component.bestTimeMessage).toEqual(`Nouveau record de temps !
                                        Vous avez effectué un temps de ${component.time} et prenez la ${component.timePosition} place !`);
    });

    it('ngOnInit should set time and timePosition with a different message if not the first best time', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        component.data = { gameFinished: true, gameWinner: true, time: 100 };
        component.ngOnInit();
        expect(component.time).toEqual('1:40');
        component.classicModeService.timePosition$.next(1);
        expect(component.timePosition).toEqual('2eme');
        expect(component.bestTimeMessage).toEqual(`Nouveau record de temps !
                                        Vous avez effectué un temps de ${component.time} et prenez la ${component.timePosition} place !`);
    });

    it('ngOnInit should set time not set any messages if best time is not in the top 3 best scores', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        component.data = { gameFinished: true, gameWinner: true, time: 600 };
        component.ngOnInit();
        expect(component.time).toEqual('10:00');
        component.classicModeService.timePosition$.next(NOT_TOP3);
        expect(component.timePosition).toBeUndefined();
        expect(component.bestTimeMessage).toBeUndefined();
    });

    it('ngOnInit should not be done if we are in the case of a abandonning dialog', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        component.data = { gameFinished: false, gameWinner: false };
        component.ngOnInit();
        expect(component.time).toBeUndefined();
        component.classicModeService.timePosition$.next(NOT_TOP3);
        expect(component.timePosition).toBeUndefined();
        expect(component.bestTimeMessage).toBeUndefined();
    });

    it('should emit true if abandon click', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        const emitAbandonSpy = spyOn((component as any).dialogRef, 'close').and.callThrough();
        component.emitAbandon(true);
        expect(emitAbandonSpy).toHaveBeenCalledWith(true);
    });

    it('should emit false if no abandon click', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        const emitAbandonSpy = spyOn((component as any).dialogRef, 'close').and.callThrough();
        component.emitAbandon(false);
        expect(emitAbandonSpy).toHaveBeenCalledWith(false);
    });
});
