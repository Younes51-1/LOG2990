import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

    it('should draw canvas', fakeAsync(() => {
        component.data.imageUrl = 'https://i.imgur.com/9Z0QZ9A.png';
        component.data.flipped = true;
        component.ngAfterViewInit();
        tick();
        expect(component.context).toBeTruthy();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.canvasDifferences.nativeElement.getBoundingClientRect().width).toEqual(640);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.canvasDifferences.nativeElement.getBoundingClientRect().height).toEqual(480);
    }));

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
});
