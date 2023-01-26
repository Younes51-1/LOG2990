import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalDialogComponent } from './modal-dialog.component';

describe('ModalDialogComponent', () => {
    let component: ModalDialogComponent;
    let fixture: ComponentFixture<ModalDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModalDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ModalDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
