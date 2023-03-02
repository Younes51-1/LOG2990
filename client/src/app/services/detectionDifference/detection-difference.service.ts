import { Injectable } from '@angular/core';
import { NumberArray, Rgba } from '@app/interfaces/creation-game';
import { Vec2 } from '@app/interfaces/vec2';
import { OffsetValues } from 'src/assets/variables/images-values';

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

    produceDifferencesMatrix(ctx1: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, radius: number): number[][] {
        const matrix: number[][] = this.createEmptyMatrix(this.pictureDimensions.height, this.pictureDimensions.width, this.emptyPixelValue);
        const data1 = ctx1.getImageData(0, 0, this.pictureDimensions.width, this.pictureDimensions.height).data;
        const data2 = ctx2.getImageData(0, 0, this.pictureDimensions.width, this.pictureDimensions.height).data;
        const rgbaOffset = 4;
        const differencesCoordinates = [];
        let differencesCoordinatesSize = 0;

        for (let i = 0; i < data1.length; i += rgbaOffset) {
            const pixelImg1: Rgba = { r: data1[i], g: data1[i + 1], b: data1[i + 2], a: data1[i + 3] };
            const pixelImg2: Rgba = { r: data2[i], g: data2[i + 1], b: data2[i + 2], a: data2[i + 3] };

            const row = Math.floor(i / rgbaOffset / this.pictureDimensions.width);
            const column = i / rgbaOffset - row * this.pictureDimensions.width;
            if (this.areEqual(pixelImg1, pixelImg2)) {
                matrix[row][column] = -1;
            } else {
                matrix[row][column] = 1;
                differencesCoordinates[differencesCoordinatesSize++] = row;
                differencesCoordinates[differencesCoordinatesSize++] = column;
            }
        }

        this.applyRadius(matrix, radius, { array: differencesCoordinates, length: differencesCoordinatesSize });

        return matrix;
    }

    applyRadius(matrix: number[][], radius: number, diffCoordinates: NumberArray) {
        const radiusCoordinates = this.computeRadiusRelativeCoordinates(radius);

        for (let i = 0; i < diffCoordinates.length; i += 2) {
            for (let k = 0; k < radiusCoordinates.length; k += 2) {
                const coordX = diffCoordinates.array[i] + radiusCoordinates.array[k];
                const coordY = diffCoordinates.array[i + 1] + radiusCoordinates.array[k + 1];
                if (coordX >= 0 && coordY >= 0 && coordX < this.pictureDimensions.height && coordY < this.pictureDimensions.width) {
                    if (matrix[coordX][coordY] === this.emptyPixelValue) {
                        matrix[coordX][coordY] = 1;
                    }
                }
            }
        }
        return matrix;
    }

    computeRadiusRelativeCoordinates(radius: number): NumberArray {
        const radiusCoordinates = [];
        let radiusCoordinatesSize = 0;
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                if (Math.sqrt(i ** 2 + j ** 2) <= radius) {
                    radiusCoordinates[radiusCoordinatesSize++] = i;
                    radiusCoordinates[radiusCoordinatesSize++] = j;
                }
            }
        }
        return { array: radiusCoordinates, length: radiusCoordinatesSize };
    }

    areEqual(val1: Rgba, val2: Rgba): boolean {
        if (val1.r === val2.r && val1.g === val2.g && val1.b === val2.b && val1.a === val2.a) {
            return true;
        }
        return false;
    }

    createEmptyMatrix(height: number, width: number, filler: number | boolean) {
        const matrix = [];
        for (let i = 0; i < height; i++) {
            matrix[i] = new Array(width).fill(filler);
        }
        return matrix;
    }

    // A SUPPRIMER DANS LE FUTUR
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

    // A SUPPRIMER DANS LE FUTUR
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
