/* eslint-disable @typescript-eslint/no-explicit-any */
// We need it to access private methods and properties in the test
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';

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

    it('should emit true if abandon click', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        const emitAbandonSpy = spyOn((component as any).dialogRef, 'close').and.callThrough();
        component.emitAbandon(true);
        expect(emitAbandonSpy).toHaveBeenCalledWith(true);
    });

    it('should emit true if no abandon click', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        const emitAbandonSpy = spyOn((component as any).dialogRef, 'close').and.callThrough();
        component.emitAbandon(false);
        expect(emitAbandonSpy).toHaveBeenCalledWith(false);
    });
});
