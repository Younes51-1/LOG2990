/* eslint-disable @typescript-eslint/no-explicit-any */
// We need it to access private methods and properties in the test
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { DeleteDialogComponent } from './delete-dialog.component';

describe('DeleteDialogComponent', () => {
    let component: DeleteDialogComponent;
    let fixture: ComponentFixture<DeleteDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeleteDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: { gameFinished: true, gameWinner: true } },
            ],
            imports: [AppRoutingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit true if abandon click', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<DeleteDialogComponent>;
        const emitSuppSpy = spyOn((component as any).dialogRef, 'close').and.callThrough();
        component.emitSupp(true);
        expect(emitSuppSpy).toHaveBeenCalledWith(true);
    });

    it('should emit true if no abandon click', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<DeleteDialogComponent>;
        const emitSuppSpy = spyOn((component as any).dialogRef, 'close').and.callThrough();
        component.emitSupp(false);
        expect(emitSuppSpy).toHaveBeenCalledWith(false);
    });
});
