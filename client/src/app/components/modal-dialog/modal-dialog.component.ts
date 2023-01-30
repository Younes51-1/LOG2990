import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-dialog',
    templateUrl: './modal-dialog.component.html',
    styleUrls: ['./modal-dialog.component.scss'],
})
export class ModalDialogComponent implements AfterViewInit {
    @ViewChild('canvasDifferences') canvasDifferences: ElementRef<HTMLCanvasElement>;
    width: number;
    height: number;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; nbDifferences: number; nbImageFlipped: number }) {
        this.width = 640;
        this.height = 480;
    }

    ngAfterViewInit(): void {
        const canvas = this.canvasDifferences.nativeElement;
        const context = canvas.getContext('2d');
        if (!context) return;
        const image = new Image();
        image.src = this.data.imageUrl;
        image.onload = () => {
            if (this.data.nbImageFlipped === 2) {
                context.translate(0, canvas.height);
                // TODO: remove eslint-disable-next-line
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                context.scale(1, -1);
            }
            context.drawImage(image, 0, 0, this.width, this.height);
        };
    }
}