import { Injectable } from '@angular/core';

export enum RadiusSize {
    None = 0,
    Default = 3,
    Medium = 9,
    Large = 15,
}

export enum OffsetValues {
    OFFSET = 10,
    WIDTH = 18,
    HEIGHT = 22,
}

interface Position {
    i: number;
    j: number;
}
const emptyPixelValue = -1;
const pixelDataSize = 4;

@Injectable({
    providedIn: 'root',
})
export class DetectionDifferenceService {
    pictureDimensions = { width: 640, height: 480 };
    differencesImage: HTMLImageElement;

    createEmptyMatrix(height: number, width: number, filler: number | boolean) {
        const matrix = [];
        for (let i = 0; i < height; i++) {
            matrix[i] = new Array(width).fill(filler);
        }
        return matrix;
    }

    convertImageToMatrix(buffer: ArrayBuffer): number[][] {
        const offset = new DataView(buffer).getInt32(OffsetValues.OFFSET, true);
        const width = Math.abs(new DataView(buffer).getInt32(OffsetValues.WIDTH, true));
        const height = Math.abs(new DataView(buffer).getInt32(OffsetValues.HEIGHT, true));

        const matrix = this.createEmptyMatrix(height, width, emptyPixelValue);

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const index = offset + (width * (height - i - 1) + j) * 3;
                matrix[i][j] = new Uint8Array(buffer, index, 1)[0];
            }
        }

        return matrix;
    }

    async readThenConvertImage(input: HTMLInputElement): Promise<number[][]> {
        return new Promise((resolve) => {
            const file: File | null = input !== null && input.files !== null ? input.files[0] : null;
            const reader: FileReader = new FileReader();

            reader.addEventListener(
                'loadend',
                () => {
                    const matrix: number[][] = this.convertImageToMatrix(reader.result as ArrayBuffer);
                    resolve(matrix);
                },
                false,
            );
            if (file) {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    populateNeighborhood(matrix: [array1: number[][], array2: number[][]], positions: Position, radius: number) {
        const [array1, array2] = matrix;

        const queue: Position[] = [{ i: positions.i, j: positions.j }];
        while (queue.length) {
            const curr = queue.shift();

            if (curr === undefined) return;

            for (let k = -radius; k <= radius; k++) {
                for (let l = -radius; l <= radius; l++) {
                    const i = curr.i + k;
                    const j = curr.j + l;
                    if (i >= 0 && i < array1.length && j >= 0 && j < array1[0].length && array1[i][j] !== array2[i][j]) {
                        array1[i][j] = array2[i][j];
                        queue.push({ i, j });
                    }
                }
            }
        }
    }

    countDifferences(array1: number[][], array2: number[][], radius: number): number {
        let differenceCount = 0;
        for (let i = 0; i < array1.length; i++) {
            for (let j = 0; j < array1[i].length; j++) {
                if (array1[i][j] !== array2[i][j]) {
                    differenceCount++;
                    this.populateNeighborhood([array1, array2], { i, j }, radius);
                }
            }
        }

        return differenceCount;
    }

    diffrencesMatrix(array1: number[][], array2: number[][], radius: number): number[][] {
        const differenceMatrix = this.createEmptyMatrix(array1.length, array1[0].length, emptyPixelValue);
        for (let i = 0; i < array1.length; i++) {
            for (let j = 0; j < array1[i].length; j++) {
                if (array1[i][j] !== array2[i][j]) {
                    for (let k = -radius; k <= radius; k++) {
                        for (let l = -radius; l <= radius; l++) {
                            if (i + k >= 0 && i + k < array1.length && j + l >= 0 && j + l < array1[0].length) {
                                differenceMatrix[i + k][j + l] = array2[i][j];
                            }
                        }
                    }
                }
            }
        }
        return differenceMatrix;
    }

    createDifferencesImage(differenceMatrix: number[][]) {
        const canvas = document.createElement('canvas');
        canvas.width = differenceMatrix[0].length;
        canvas.height = differenceMatrix.length;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return '';
        const imageData = ctx.createImageData(differenceMatrix[0].length, differenceMatrix.length);
        const data = imageData.data;
        for (let i = 0; i < differenceMatrix.length; i++) {
            for (let j = 0; j < differenceMatrix[0].length; j++) {
                const index = (i * differenceMatrix[0].length + j) * pixelDataSize;
                if (differenceMatrix[i][j] !== emptyPixelValue) {
                    data[index] = 0;
                    data[index + 1] = 0;
                    data[index + 2] = 0;
                    data[index + 3] = 255;
                } else {
                    data[index] = 255;
                    data[index + 1] = 255;
                    data[index + 2] = 255;
                    data[index + 3] = 255;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    }

    computeLevelDifficulty(nDifferences: number, differenceMatrix: number[][]) {
        const nDifferencesThreshold = 7;
        const surfaceCoveredThreshold = 0.15;

        if (nDifferences < nDifferencesThreshold) {
            return 'facile';
        }

        let differentPixelCounter = 0;
        for (let i = 0; i < this.pictureDimensions.height; i++) {
            for (let j = 0; j < this.pictureDimensions.width; j++) {
                if (differenceMatrix[i][j] !== emptyPixelValue) {
                    differentPixelCounter++;
                }
            }
        }

        const surfaceCovered: number = differentPixelCounter / (this.pictureDimensions.height * this.pictureDimensions.width);
        if (surfaceCovered > surfaceCoveredThreshold) {
            return 'facile';
        } else {
            return 'difficile';
        }
    }
}
