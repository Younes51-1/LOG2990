import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';

describe('EndgameDialogComponent', () => {
    let component: EndgameDialogComponent;
    let fixture: ComponentFixture<EndgameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndgameDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: { gameFinished: true, gameWinner: true } },
            ],
            imports: [AppRoutingModule],
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
        component.dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        const emitAbandonSpy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.emitAbandon(true);
        expect(emitAbandonSpy).toHaveBeenCalledWith(true);
    });

    it('should emit true if no abandon click', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        component.dialogRef = { close: () => {} } as MatDialogRef<EndgameDialogComponent>;
        const emitAbandonSpy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.emitAbandon(false);
        expect(emitAbandonSpy).toHaveBeenCalledWith(false);
    });
});
