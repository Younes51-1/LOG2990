import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { Dimensions } from 'src/assets/variables/picture-dimension';
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
    width = Dimensions.DefaultWidth;
    height = Dimensions.DefaultHeight;
    inputValue: string;
    applyBorder = false;

    private context: CanvasRenderingContext2D;
    private image: HTMLImageElement;

    constructor(
        private verifyInputService: VerifyInputService,
        private dialogRef: MatDialogRef<CreationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; nbDifferences: number },
    ) {}

    ngAfterViewInit(): void {
        this.context = this.canvasDifferences.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.image = new Image();
        this.image.src = this.data.imageUrl;
        this.image.onload = () => {
            this.drawImage(this.image);
        };
    }

    toggleBorder() {
        if (!this.verifyInputService.verify(this.inputValue)) {
            this.applyBorder = true;
        } else {
            this.emitNameGame();
            this.applyBorder = false;
        }
    }

    private drawImage(image: HTMLImageElement) {
        this.context.drawImage(image, 0, 0, this.width, this.height);
    }

    private emitNameGame() {
        this.dialogRef.close(this.inputValue);
    }
}
