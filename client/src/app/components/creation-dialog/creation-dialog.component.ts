import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VerifyInputService } from '@app/services/verifyInput/verify-input.service';

@Component({
    selector: 'app-creation-modal-dialog',
    templateUrl: './creation-dialog.component.html',
    styleUrls: ['./creation-dialog.component.scss'],
    styles: [
        `
            .md-dialog-container {
                top: -10%;
            }
        `,
    ],
})
export class CreationDialogComponent implements AfterViewInit {
    @ViewChild('canvasDifferences') canvasDifferences: ElementRef<HTMLCanvasElement>;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
    image: HTMLImageElement;
    scaleNumber: number = 1;
    inputValue: string;
    applyBorder = false;

    constructor(
        private verifyInputService: VerifyInputService,
        public dialogRef: MatDialogRef<CreationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; nbDifferences: number },
    ) {
        this.width = 640;
        this.height = 480;
    }

    ngAfterViewInit(): void {
        this.context = this.canvasDifferences.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.image = new Image();
        this.image.src = this.data.imageUrl;
        this.image.onload = () => {
            this.drawImage(this.image);
        };
    }

    drawImage(image: HTMLImageElement) {
        this.context.drawImage(image, 0, 0, this.width, this.height);
    }

    emitNameGame() {
        this.dialogRef.close(this.inputValue);
    }

    toggleBorder() {
        if (!this.verifyInputService.verify(this.inputValue)) {
            this.applyBorder = true;
        } else {
            this.emitNameGame();
            this.applyBorder = false;
        }
    }
}
