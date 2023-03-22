/* eslint-disable @typescript-eslint/no-explicit-any */
// We need it to access private methods and properties in the test
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreationDialogComponent } from '@app/components/creation-dialog/creation-dialog.component';

describe('CreationDialogComponent', () => {
    let component: CreationDialogComponent;
    let fixture: ComponentFixture<CreationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [CreationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should load image', (done) => {
        const drawImageSpy = spyOn(component as any, 'drawImage').and.callFake(() => {
            return;
        });
        component.data.imageUrl = 'https://i.imgur.com/tG1K4kJ.jpeg';
        component.ngAfterViewInit();
        (component as any).image.dispatchEvent(new Event('load'));
        setTimeout(() => {
            expect(drawImageSpy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should draw canvas', () => {
        component.data.imageUrl = 'https://i.imgur.com/9Z0QZ9A.png';
        const drawImagespy = spyOn(component.context, 'drawImage').and.callFake(() => {
            return;
        });
        const translateSpy = spyOn(component.context, 'translate').and.callFake(() => {
            return;
        });
        const scaleSpy = spyOn(component.context, 'scale').and.callFake(() => {
            return;
        });
        (component as any).drawImage(new Image());
        expect(drawImagespy).toHaveBeenCalled();
        expect(translateSpy).not.toHaveBeenCalled();
        expect(scaleSpy).not.toHaveBeenCalled();
    });

    it('should show the right amount of differences', () => {
        component.data.nbDifferences = 5;
        fixture.detectChanges();
        const differences = fixture.nativeElement.querySelector('p');
        expect(differences.textContent).toContain('5');
    });

    it('should emit the name of the game', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (component as any).dialogRef = { close: () => {} } as MatDialogRef<CreationDialogComponent>;
        const emitNameGameSpy = spyOn((component as any).dialogRef, 'close').and.callThrough();
        component.inputValue = 'test';
        (component as any).emitNameGame();
        expect(emitNameGameSpy).toHaveBeenCalledWith('test');
    });

    it('should toggle the border if inputValue is incorrect', () => {
        component.inputValue = '';
        component.applyBorder = false;
        component.toggleBorder();
        expect(component.applyBorder).toBe(true);
    });

    it('should call emitNameGame if inputValue is correct', () => {
        spyOn(component as any, 'emitNameGame');
        component.inputValue = 'test';
        component.toggleBorder();
        expect((component as any).emitNameGame).toHaveBeenCalled();
    });
});
