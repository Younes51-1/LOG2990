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
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should draw canvas', () => {
        component.data.imageUrl = 'https://i.imgur.com/9Z0QZ9A.png';
        component.data.flipped = false;
        const drawImagespy = spyOn(component.context, 'drawImage').and.callFake(() => {
            return;
        });
        const translateSpy = spyOn(component.context, 'translate').and.callFake(() => {
            return;
        });
        const scaleSpy = spyOn(component.context, 'scale').and.callFake(() => {
            return;
        });

        component.drawImage(new Image());
        expect(drawImagespy).toHaveBeenCalled();
        expect(translateSpy).not.toHaveBeenCalled();
        expect(scaleSpy).not.toHaveBeenCalled();
    });

    it('should draw canvas and flipp image', () => {
        component.data.imageUrl = 'https://i.imgur.com/9Z0QZ9A.png';
        component.data.flipped = true;
        const drawImagespy = spyOn(component.context, 'drawImage').and.callFake(() => {
            return;
        });
        const translateSpy = spyOn(component.context, 'translate').and.callFake(() => {
            return;
        });
        const scaleSpy = spyOn(component.context, 'scale').and.callFake(() => {
            return;
        });

        component.drawImage(new Image());
        expect(drawImagespy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalled();
        expect(scaleSpy).toHaveBeenCalled();
    });

    it('should show the right amount of differences', () => {
        component.data.nbDifferences = 5;
        fixture.detectChanges();
        const differences = fixture.nativeElement.querySelector('p');
        expect(differences.textContent).toContain('5');
    });

    it('should emit the name of the game', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        component.dialogRef = { close: () => {} } as MatDialogRef<ModalDialogComponent>;
        const emitNameGameSpy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.inputValue = 'test';
        component.emitNameGame();
        expect(emitNameGameSpy).toHaveBeenCalledWith('test');
    });

    it('should toggle the border if inputValue is incorrect', () => {
        component.inputValue = '';
        component.applyBorder = false;
        component.toggleBorder();
        expect(component.applyBorder).toBe(true);
    });

    it('should call emitNameGame if inputValue is correct', () => {
        spyOn(component, 'emitNameGame');
        component.inputValue = 'test';
        component.toggleBorder();
        expect(component.emitNameGame).toHaveBeenCalled();
    });
});
