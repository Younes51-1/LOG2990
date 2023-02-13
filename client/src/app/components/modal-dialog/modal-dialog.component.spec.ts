import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
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

    it('should draw canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const context = CanvasTestHelper.createCanvas(640, 480).getContext('2d') as CanvasRenderingContext2D;
        component.context = context;
        const drawImageSpy = spyOn(component.context, 'drawImage').and.stub();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        context.clearRect(0, 0, 640, 480);
        component.data.imageUrl = context.canvas.toDataURL();
        component.ngAfterViewInit();
        expect(drawImageSpy).not.toHaveBeenCalled();
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
});
