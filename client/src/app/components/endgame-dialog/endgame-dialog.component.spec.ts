import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndgameDialogComponent } from './endgame-dialog.component';

describe('EndgameDialogComponent', () => {
    let component: EndgameDialogComponent;
    let fixture: ComponentFixture<EndgameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndgameDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EndgameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
