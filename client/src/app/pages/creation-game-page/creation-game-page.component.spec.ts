import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CreationGamePageComponent } from './creation-game-page.component';

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

    it('radius must be updated when a radio button is selected', () => {
        const radiuses = [0, 3, 9, 15];
        const spy = spyOn(component, 'updateRadius').and.callThrough();
        for (const radius of radiuses) {
            const inputRayon = fixture.debugElement.nativeElement.querySelector('#rayon' + radius);
            inputRayon.click();
            expect(spy).toHaveBeenCalled();
            expect(component.radius).toBe(radius);
        }
    });
    it('by default, radio button 3 must be selected', () => {
        const inputRayon3 = fixture.debugElement.nativeElement.querySelector('#rayon3');
        expect(inputRayon3.checked).toBeTruthy();
    });

    it('reset should leave the canvas blank', () => {
        const image = new Image();
        image.src = 'image_2_diff.bmp';
        image.onload = () => {
            component.context1.drawImage(image, 0, 0, component.width, component.height);
        };
        const spyReset = spyOn(component, 'reset').and.callThrough();
        const spyClearRect = spyOn(component.context1, 'clearRect').and.callThrough();
        component.reset();
        expect(spyReset).toHaveBeenCalled();
        expect(spyClearRect).toHaveBeenCalled();
    });
});
