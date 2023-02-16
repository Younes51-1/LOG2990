import { Injectable } from '@angular/core';
import { OffsetValues } from 'src/assets/variables/images-values';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class DetectionDifferenceService {
    pictureDimensions = { width: 640, height: 480 };
    differencesImage: HTMLImageElement;
    emptyPixelValue: number;
    pixelDataSize: number;
    negativeDifferenceCoord: number;
    positiveDifferenceCoord: number;

    constructor() {
        this.emptyPixelValue = -1;
        this.negativeDifferenceCoord = -1;
        this.positiveDifferenceCoord = 1;
        this.pixelDataSize = 4;
    }
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

        const matrix = this.createEmptyMatrix(height, width, this.emptyPixelValue);

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
            const file: File | null = input.files?.item(0) ?? null;
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

    populateNeighborhood(matrix: [array1: number[][], array2: number[][]], positions: Vec2, radius: number) {
        const [array1, array2] = matrix;

        const queue: Vec2[] = [{ x: positions.x, y: positions.y }];
        while (queue.length) {
            const curr = queue.shift();

            if (!curr) return;

            for (let k = -radius - 1; k <= radius + 1; k++) {
                for (let l = -radius - 1; l <= radius + 1; l++) {
                    const x = curr.x + k;
                    const y = curr.y + l;
                    if (x >= 0 && x < array1.length && y >= 0 && y < array1[0].length && array1[x][y] !== array2[x][y]) {
                        array1[x][y] = array2[x][y];
                        queue.push({ x, y });
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
                    this.populateNeighborhood([array1, array2], { x: i, y: j }, radius);
                }
            }
        }

        return differenceCount;
    }

    differencesMatrix(array1: number[][], array2: number[][], radius: number): number[][] {
        const height = array1.length;
        const width = array1[0].length;

        const differenceMatrix = this.createEmptyMatrix(height, width, this.emptyPixelValue);
        const differencesCoordinatesArray = [];
        let differencesCoordinatesArraySize = 0;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (array1[i][j] !== array2[i][j]) {
                    differenceMatrix[i][j] = array2[i][j];
                    differencesCoordinatesArray[differencesCoordinatesArraySize++] = i;
                    differencesCoordinatesArray[differencesCoordinatesArraySize++] = j;
                }
            }
        }
        const radiusCoordinatesArray = [];
        let radiusCoordinatesArraySize = 0;
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                if (Math.sqrt(i ** 2 + j ** 2) <= radius) {
                    radiusCoordinatesArray[radiusCoordinatesArraySize++] = i;
                    radiusCoordinatesArray[radiusCoordinatesArraySize++] = j;
                }
            }
        }

        for (let i = 0; i < differencesCoordinatesArraySize; i += 2) {
            for (let k = 0; k < radiusCoordinatesArraySize; k += 2) {
                const coordX = differencesCoordinatesArray[i] + radiusCoordinatesArray[k];
                const coordY = differencesCoordinatesArray[i + 1] + radiusCoordinatesArray[k + 1];
                if (coordX >= 0 && coordY >= 0 && coordX < height && coordY < width) {
                    if (differenceMatrix[coordX][coordY] === this.emptyPixelValue) {
                        differenceMatrix[coordX][coordY] = array2[coordX][coordY];
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
                const index = (i * differenceMatrix[0].length + j) * this.pixelDataSize;
                if (differenceMatrix[i][j] !== this.emptyPixelValue) {
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
                if (differenceMatrix[i][j] !== this.emptyPixelValue) {
                    differentPixelCounter++;
                }
            }
        }

        const surfaceCovered: number = differentPixelCounter / (this.pictureDimensions.height * this.pictureDimensions.width);
        return surfaceCovered > surfaceCoveredThreshold ? 'facile' : 'difficile';
    }

    extractDifference(differenceMatrix: number[][], xCoord: number, yCoord: number) {
        const result = this.createEmptyMatrix(differenceMatrix.length, differenceMatrix[0].length, this.emptyPixelValue);
        const difference = this.findDifference(differenceMatrix, yCoord, xCoord);
        for (const [x, y] of difference) {
            result[x][y] = 1;
        }
        return result;
    }

    findDifference(differenceMatrix: number[][], yCoord: number, xCoord: number) {
        const difference: [number, number][] = [];
        const visited = this.createEmptyMatrix(differenceMatrix.length, differenceMatrix[0].length, 0);
        const directions = [
            [this.negativeDifferenceCoord, 0],
            [0, this.positiveDifferenceCoord],
            [this.positiveDifferenceCoord, 0],
            [0, this.negativeDifferenceCoord],
        ];

        if (differenceMatrix[yCoord][xCoord] !== this.emptyPixelValue) {
            const stack = [[yCoord, xCoord]];
            while (stack.length > 0) {
                const curr = stack.shift();
                if (curr === undefined) continue;
                const [x, y] = curr;
                if (!visited[x][y]) {
                    visited[x][y] = 1;
                    difference.push([x, y]);
                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (
                            nx >= 0 &&
                            nx < differenceMatrix.length &&
                            ny >= 0 &&
                            ny < differenceMatrix[0].length &&
                            differenceMatrix[nx][ny] !== this.emptyPixelValue
                        ) {
                            stack.push([nx, ny]);
                        }
                    }
                }
            }
        }

        return difference;
    }
}
