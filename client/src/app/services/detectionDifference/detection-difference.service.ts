import { Injectable } from '@angular/core';
import { Rgba } from '@app/interfaces/creation-game';
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

    generateDifferencesMatrix(ctx1: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, radius: number): number[][] {
        const matrix: number[][] = this.createEmptyMatrix(this.pictureDimensions.height, this.pictureDimensions.width, this.emptyPixelValue);
        const data1 = ctx1.getImageData(0, 0, this.pictureDimensions.width, this.pictureDimensions.height).data;
        const data2 = ctx2.getImageData(0, 0, this.pictureDimensions.width, this.pictureDimensions.height).data;
        const rgbaOffset = 4;
        const differencesCoordinates = [];

        for (let i = 0; i < data1.length; i += rgbaOffset) {
            const pixelImg1: Rgba = { r: data1[i], g: data1[i + 1], b: data1[i + 2], a: data1[i + 3] };
            const pixelImg2: Rgba = { r: data2[i], g: data2[i + 1], b: data2[i + 2], a: data2[i + 3] };

            const row = Math.floor(i / rgbaOffset / this.pictureDimensions.width);
            const column = i / rgbaOffset - row * this.pictureDimensions.width;
            if (this.areEqual(pixelImg1, pixelImg2)) {
                matrix[row][column] = this.emptyPixelValue;
            } else {
                matrix[row][column] = 1;
                differencesCoordinates[differencesCoordinates.length] = row;
                differencesCoordinates[differencesCoordinates.length] = column;
            }
        }

        this.applyRadius(matrix, radius, differencesCoordinates);

        return matrix;
    }

    applyRadius(matrix: number[][], radius: number, diffCoordinates: number[]) {
        const radiusCoordinates = this.computeRadiusRelativeCoordinates(radius);

        for (let i = 0; i < diffCoordinates.length; i += 2) {
            for (let k = 0; k < radiusCoordinates.length; k += 2) {
                const coordX = diffCoordinates[i] + radiusCoordinates[k];
                const coordY = diffCoordinates[i + 1] + radiusCoordinates[k + 1];
                if (coordX >= 0 && coordY >= 0 && coordX < this.pictureDimensions.height && coordY < this.pictureDimensions.width) {
                    if (matrix[coordX][coordY] === this.emptyPixelValue) {
                        matrix[coordX][coordY] = 1;
                    }
                }
            }
        }
        return matrix;
    }

    computeRadiusRelativeCoordinates(radius: number): number[] {
        const radiusCoordinates = [];
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                if (Math.sqrt(i ** 2 + j ** 2) <= radius) {
                    radiusCoordinates[radiusCoordinates.length] = i;
                    radiusCoordinates[radiusCoordinates.length] = j;
                }
            }
        }
        return radiusCoordinates;
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

    countDifferences(diffMatrix: number[][]): number {
        let differenceCount = 0;
        const matrix = this.copyMatrix(diffMatrix);
        for (let i = 0; i < this.pictureDimensions.height; i++) {
            for (let j = 0; j < this.pictureDimensions.width; j++) {
                if (matrix[i][j] !== this.emptyPixelValue) {
                    differenceCount++;
                    this.deleteDifference(matrix, { x: i, y: j });
                }
            }
        }
        return differenceCount;
    }

    deleteDifference(matrix: number[][], pos: Vec2) {
        const stack: Vec2[] = [];
        this.pushNeighborsToStack(stack, pos);
        matrix[pos.x][pos.y] = this.emptyPixelValue;
        while (stack.length > 0) {
            const newPos = stack.pop();
            if (newPos) {
                if (matrix[newPos.x][newPos.y] !== this.emptyPixelValue) {
                    matrix[newPos.x][newPos.y] = this.emptyPixelValue;
                    this.pushNeighborsToStack(stack, newPos);
                }
            }
        }
    }

    pushNeighborsToStack(stack: Vec2[], pos: Vec2) {
        this.pushToStack(stack, { x: pos.x, y: pos.y - 1 });
        this.pushToStack(stack, { x: pos.x, y: pos.y + 1 });
        this.pushToStack(stack, { x: pos.x + 1, y: pos.y - 1 });
        this.pushToStack(stack, { x: pos.x + 1, y: pos.y });
        this.pushToStack(stack, { x: pos.x + 1, y: pos.y + 1 });
        this.pushToStack(stack, { x: pos.x - 1, y: pos.y - 1 });
        this.pushToStack(stack, { x: pos.x - 1, y: pos.y });
        this.pushToStack(stack, { x: pos.x - 1, y: pos.y + 1 });
    }

    pushToStack(stack: Vec2[], pos: Vec2) {
        if (pos.x >= 0 && pos.x < this.pictureDimensions.height && pos.y >= 0 && pos.y < this.pictureDimensions.width) {
            stack.push(pos);
        }
    }

    copyMatrix(matrix: number[][]): number[][] {
        const newMatrix = this.createEmptyMatrix(this.pictureDimensions.height, this.pictureDimensions.width, 1);
        for (let i = 0; i < this.pictureDimensions.height; i++) {
            for (let j = 0; j < this.pictureDimensions.width; j++) {
                newMatrix[i][j] = matrix[i][j];
            }
        }
        return newMatrix;
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
