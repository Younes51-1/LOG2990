import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CreationDialogComponent } from '@app/components/creation-dialog/creation-dialog.component';
import { NewGame } from '@app/interfaces/game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { AsciiLetterValue, BitPerPixel, OffsetValues } from 'src/assets/variables/images-values';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';

@Injectable({
    providedIn: 'root',
})
export class ImageLoadService {
    private component: CreationGamePageComponent;
    private width: number;
    private height: number;

    constructor(
        private router: Router,
        private detectionService: DetectionDifferenceService,
        private communicationService: CommunicationHttpService,
    ) {}

    setComponent(component: CreationGamePageComponent) {
        this.component = component;
        this.width = this.component.width;
        this.height = this.component.height;
    }

    verifyImageFormat(e: Event, img: HTMLInputElement): void {
        const file = (e.target as HTMLInputElement).files;
        if (file) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file[0]);
            reader.onload = () => {
                this.handleReaderOnload(reader, e, img);
            };
        }
    }

    runDetectionSystem() {
        const img1HasContent: boolean = this.component.image1?.value !== undefined;
        const img2HasContent: boolean = this.component.image2?.value !== undefined;

        if ((img1HasContent && img2HasContent) || this.component.previousForegroundStates.length > 0) {
            this.component.differenceMatrix = this.detectionService.generateDifferencesMatrix(
                this.component.context1,
                this.component.context2,
                this.component.radius,
            );
            this.component.differenceCount = this.detectionService.countDifferences(JSON.parse(JSON.stringify(this.component.differenceMatrix)));
            this.component.imageDifferencesUrl = this.detectionService.createDifferencesImage(this.component.differenceMatrix);
            this.component.difficulty = this.detectionService.computeLevelDifficulty(
                this.component.differenceCount,
                JSON.parse(JSON.stringify(this.component.differenceMatrix)),
            );
            this.openDifferencesDialog();
        }
    }

    private getImageData(reader: FileReader) {
        const width = Math.abs(new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.WIDTH, true));
        const height = Math.abs(new DataView(reader.result as ArrayBuffer).getInt32(OffsetValues.HEIGHT, true));
        const data = new Uint8Array(reader.result as ArrayBuffer);

        const hasCorrectDimensions = width === this.width && height === this.height;
        const isBmp = data[0] === AsciiLetterValue.B && data[1] === AsciiLetterValue.M;
        const is24BitPerPixel = data[OffsetValues.DHP] === BitPerPixel.BitPerPixel;

        return { hasCorrectDimensions, isBmp, is24BitPerPixel };
    }

    private handleReaderOnload(reader: FileReader, e: Event, img: HTMLInputElement): void {
        const { hasCorrectDimensions, isBmp, is24BitPerPixel } = this.getImageData(reader);
        if (!(isBmp && is24BitPerPixel) || !hasCorrectDimensions) {
            img.value = '';
        }
        if (!hasCorrectDimensions && !(isBmp && is24BitPerPixel)) {
            alert('Image refusée: elle ne respecte pas le format BMP-24 bit de taille 640x480');
        } else if (!hasCorrectDimensions) {
            alert("Image refusée: elle n'est pas de taille 640x480");
        } else if (!(isBmp && is24BitPerPixel)) {
            alert('Image refusée: elle ne respecte pas le format BMP-24 bit');
        } else {
            this.component.getForegroundService.updateImageDisplay(e, img);
        }
    }

    private saveNameGame(name: string) {
        this.component.nameGame = name;
        const newGame: NewGame = {
            name,
            image1: this.convertImageToB64Url(this.component.canvas1.nativeElement),
            image2: this.convertImageToB64Url(this.component.canvas2.nativeElement),
            nbDifference: this.component.differenceCount,
            difficulty: this.component.difficulty,
            differenceMatrix: this.component.differenceMatrix,
        };
        this.communicationService.getGame(newGame.name).subscribe((res) => {
            if (!res || Object.keys(res).length === 0) {
                this.communicationService.createNewGame(newGame).subscribe({
                    next: () => {
                        this.router.navigate(['/config']);
                    },
                    error: () => {
                        alert('Erreur lors de la création du jeu');
                    },
                });
            } else {
                alert('Nom de jeu déjà utilisé');
            }
        });
    }

    private convertImageToB64Url(canvas: HTMLCanvasElement): string {
        return canvas.toDataURL().split(',')[1];
    }

    private openDifferencesDialog() {
        this.component.dialogRef = this.component.dialog.open(CreationDialogComponent, {
            data: {
                imageUrl: this.component.imageDifferencesUrl,
                nbDifferences: this.component.differenceCount,
            },
        });
        if (this.component.dialogRef) {
            this.component.dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.saveNameGame(result);
                }
            });
        }
    }
}
