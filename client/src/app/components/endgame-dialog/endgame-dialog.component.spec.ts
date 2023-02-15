import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { Location } from '@angular/common';

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
            imports: [AppRoutingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(EndgameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should redirect to home page on click', fakeAsync(() => {
        const location = TestBed.inject(Location);
        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        tick();
        expect(location.path()).toEqual('/home');
    }));
});
