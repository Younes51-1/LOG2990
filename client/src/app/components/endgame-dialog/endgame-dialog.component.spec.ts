/* eslint-disable @typescript-eslint/no-explicit-any */
// We need it to access private methods and properties in the test
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { GameService } from '@app/services/game/game.service';
import { VideoReplayDialogComponent } from '@app/components/video-replay-dialog/video-replay-dialog.component';

describe('EndgameDialogComponent', () => {
    let component: EndgameDialogComponent;
    let fixture: ComponentFixture<EndgameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndgameDialogComponent],
            imports: [AppRoutingModule, HttpClientTestingModule, MatDialogModule],
            providers: [
                GameService,
                ConfigHttpService,
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: { gameFinished: false, gameWinner: true, time: 0 } },
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
        component.data = { gameFinished: true, gameWinner: true, time: 100 };
        component.ngOnInit();
        expect(component.time).toEqual('1:40');
        component.gameService.timePosition$.next(0);
        expect(component.timePosition).toEqual('1er');
        expect(component.bestTimeMessage).toEqual(`Nouveau record de temps !
                                        Vous avez effectué un temps de ${component.time} et prenez la ${component.timePosition} place !`);
    });

    it('ngOnInit should set time and timePosition with a different message if not the first best time', () => {
        component.data = { gameFinished: true, gameWinner: true, time: 100 };
        component.ngOnInit();
        expect(component.time).toEqual('1:40');
        component.gameService.timePosition$.next(1);
        expect(component.timePosition).toEqual('2eme');
        expect(component.bestTimeMessage).toEqual(`Nouveau record de temps !
                                        Vous avez effectué un temps de ${component.time} et prenez la ${component.timePosition} place !`);
    });

    it('ngOnInit should not be done if we are in the case of a abandonning dialog', () => {
        component.ngOnInit();
        expect(component.time).toBeUndefined();
        component.gameService.timePosition$.next(1);
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

    it('openVideo should call open videoReplayDialog dialog', () => {
        const openVideoReplayDialogSpy = spyOn((component as any).videoReplayDialog, 'open').and.stub();
        component.openVideoReplay();
        expect(openVideoReplayDialogSpy).toHaveBeenCalledWith(VideoReplayDialogComponent, {
            data: { videoReplay: component.data.videoReplay },
            disableClose: true,
            width: '62%',
            height: '80%',
        });
    });
});
