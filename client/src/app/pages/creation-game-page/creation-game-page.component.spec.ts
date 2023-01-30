import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreationGamePageComponent } from './creation-game-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('CreationGamePageComponent', () => {
    let component: CreationGamePageComponent;
    let fixture: ComponentFixture<CreationGamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, HttpClientModule],
            declarations: [CreationGamePageComponent],
            providers: [
                { provide: MatDialog },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        image: null,
                        nbDifferences: 5,
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
