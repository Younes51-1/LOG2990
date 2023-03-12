import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VerifyInputService } from '@app/services/verifyInput/verify-input.service';

@Component({
    selector: 'app-modal-dialog',
    templateUrl: './modal-dialog.component.html',
    styleUrls: ['./modal-dialog.component.scss'],
    styles: [
        `
            .md-dialog-container {
                top: -10%;
            }
        `,
    ],
})
export class ModalDialogComponent implements AfterViewInit {
    @ViewChild('canvasDifferences') canvasDifferences: ElementRef<HTMLCanvasElement>;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
    scaleNumber: number = 1;
    inputValue: string;
    applyBorder = false;

    constructor(
        private verifyInputService: VerifyInputService,
        public dialogRef: MatDialogRef<ModalDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; nbDifferences: number; flipped: boolean },
    ) {
        this.width = 640;
        this.height = 480;
    }

    ngAfterViewInit(): void {
        this.context = this.canvasDifferences.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const image = new Image();
        image.src = this.data.imageUrl;
        image.onload = () => {
            this.drawImage(image);
        };
    }

    drawImage(image: HTMLImageElement) {
        const scale = { x: 1, y: -1 };
        if (this.data.flipped) {
            this.context.translate(0, this.canvasDifferences.nativeElement.height);
            this.context.scale(scale.x, scale.y);
        }
        this.context.drawImage(image, 0, 0, this.width, this.height);
    }

    emitNameGame() {
        this.dialogRef.close(this.inputValue);
    }

    toggleBorder() {
        if (!this.verifyInputService.verify(this.inputValue)) {
            this.applyBorder = !this.applyBorder;
        } else {
            this.emitNameGame();
        }
    }
}
