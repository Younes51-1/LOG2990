import { Injectable } from '@angular/core';
import { Rgba } from '@app/interfaces/creation-game';
import { Vec2 } from '@app/interfaces/vec2';
import { PixelSize, PossibleColor } from 'src/assets/variables/images-values';
import { Dimensions } from 'src/assets/variables/picture-dimension';

@Injectable({
    providedIn: 'root',
})
export class DetectionDifferenceService {
    private width = Dimensions.DEFAULT_WIDTH;
    private height = Dimensions.DEFAULT_HEIGHT;
    private positiveDifferenceCoord = 1;
    private negativeDifferenceCoord = -this.positiveDifferenceCoord;

    generateDifferencesMatrix(ctx1: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, radius: number): number[][] {
        const matrix: number[][] = this.createEmptyMatrix(this.height, this.width, PossibleColor.EMPTYPIXEL);
        const data1 = ctx1.getImageData(0, 0, this.width, this.height).data;
        const data2 = ctx2.getImageData(0, 0, this.width, this.height).data;
        const differencesCoordinates = [];

        for (let i = 0; i < data1.length; i += PixelSize) {
            const pixelImg1: Rgba = { r: data1[i], g: data1[i + 1], b: data1[i + 2], a: data1[i + 3] };
            const pixelImg2: Rgba = { r: data2[i], g: data2[i + 1], b: data2[i + 2], a: data2[i + 3] };

            const row = Math.floor(i / PixelSize / this.width);
            const column = i / PixelSize - row * this.width;
            if (this.areEqual(pixelImg1, pixelImg2)) {
                matrix[row][column] = PossibleColor.EMPTYPIXEL;
            } else {
                matrix[row][column] = 1;
                differencesCoordinates[differencesCoordinates.length] = row;
                differencesCoordinates[differencesCoordinates.length] = column;
            }
        }

        this.applyRadius(matrix, radius, differencesCoordinates);

        return matrix;
    }

    countDifferences(diffMatrix: number[][]): number {
        let differenceCount = 0;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (diffMatrix[i][j] !== PossibleColor.EMPTYPIXEL) {
                    differenceCount++;
                    this.deleteDifference(diffMatrix, { x: i, y: j });
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
                const index = (i * differenceMatrix[0].length + j) * PixelSize;
                if (differenceMatrix[i][j] !== PossibleColor.EMPTYPIXEL) {
                    data[index] = PossibleColor.BLACK;
                    data[index + 1] = PossibleColor.BLACK;
                    data[index + 2] = PossibleColor.BLACK;
                    data[index + 3] = PossibleColor.WHITE;
                } else {
                    data[index] = PossibleColor.WHITE;
                    data[index + 1] = PossibleColor.WHITE;
                    data[index + 2] = PossibleColor.WHITE;
                    data[index + 3] = PossibleColor.WHITE;
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
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (differenceMatrix[i][j] !== PossibleColor.EMPTYPIXEL) {
                    differentPixelCounter++;
                }
            }
        }

        const surfaceCovered: number = differentPixelCounter / (this.height * this.width);
        return surfaceCovered > surfaceCoveredThreshold ? 'facile' : 'difficile';
    }

    extractDifference(differenceMatrix: number[][], coords: Vec2): number[][] {
        const result = this.createEmptyMatrix(differenceMatrix.length, differenceMatrix[0].length, PossibleColor.EMPTYPIXEL);
        if (differenceMatrix[coords.y][coords.x] === PossibleColor.EMPTYPIXEL) {
            return result;
        }
        const difference = this.findDifference(differenceMatrix, coords);
        for (const [x, y] of difference) {
            result[x][y] = 1;
        }
        return result;
    }

    findRandomDifference(matrix: number[][]) {
        const xCoord = Math.floor(Math.random() * (matrix.length + 1));
        const yCoord = Math.floor(Math.random() * (matrix[0].length + 1));

        const numRows = matrix.length;
        const numCols = matrix[0].length;
        const visited = new Array(numRows).fill(false).map(() => new Array(numCols).fill(false));
        const queue: Vec2[] = [{ x: xCoord, y: yCoord }];
        visited[xCoord][yCoord] = true;

        while (queue.length > 0) {
            const currCoord = queue.shift();
            if (!currCoord) continue;
            if (matrix[currCoord.x][currCoord.y] !== PossibleColor.EMPTYPIXEL) {
                return currCoord;
            }
            const neighbors = this.getNeighbors(currCoord, numRows, numCols);
            for (const neighbor of neighbors) {
                const { x, y } = neighbor;
                if (!visited[x][y]) {
                    visited[x][y] = true;
                    queue.push(neighbor);
                }
            }
        }
        return null;
    }

    createEmptyMatrix(height: number, width: number, filler: number | boolean) {
        const matrix = [];
        for (let i = 0; i < height; i++) {
            matrix[i] = new Array(width).fill(filler);
        }
        return matrix;
    }

    private applyRadius(matrix: number[][], radius: number, diffCoordinates: number[]) {
        const radiusCoordinates = this.computeRadiusRelativeCoordinates(radius);

        for (let i = 0; i < diffCoordinates.length; i += 2) {
            for (let k = 0; k < radiusCoordinates.length; k += 2) {
                const coordX = diffCoordinates[i] + radiusCoordinates[k];
                const coordY = diffCoordinates[i + 1] + radiusCoordinates[k + 1];
                if (coordX >= 0 && coordY >= 0 && coordX < this.height && coordY < this.width) {
                    if (matrix[coordX][coordY] === PossibleColor.EMPTYPIXEL) {
                        matrix[coordX][coordY] = 1;
                    }
                }
            }
        }
        return matrix;
    }

    private computeRadiusRelativeCoordinates(radius: number): number[] {
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

    private areEqual(val1: Rgba, val2: Rgba): boolean {
        if (val1.r === val2.r && val1.g === val2.g && val1.b === val2.b && val1.a === val2.a) {
            return true;
        }
        return false;
    }

    private deleteDifference(matrix: number[][], pos: Vec2) {
        const stack: Vec2[] = [];
        this.pushNeighborsToStack(stack, pos);
        matrix[pos.x][pos.y] = PossibleColor.EMPTYPIXEL;
        while (stack.length > 0) {
            const newPos = stack.pop();
            if (newPos) {
                if (matrix[newPos.x][newPos.y] !== PossibleColor.EMPTYPIXEL) {
                    matrix[newPos.x][newPos.y] = PossibleColor.EMPTYPIXEL;
                    this.pushNeighborsToStack(stack, newPos);
                }
            }
        }
    }

    private getNeighbors(coords: Vec2, numRows: number, numCols: number) {
        const { x, y } = coords;
        const neighbors: Vec2[] = [];
        if (x > 0) neighbors.push({ x: x - 1, y });
        if (x < numRows - 1) neighbors.push({ x: x + 1, y });
        if (y > 0) neighbors.push({ x, y: y - 1 });
        if (y < numCols - 1) neighbors.push({ x, y: y + 1 });
        return neighbors;
    }

    private pushNeighborsToStack(stack: Vec2[], pos: Vec2) {
        this.pushToStack(stack, { x: pos.x, y: pos.y - 1 });
        this.pushToStack(stack, { x: pos.x, y: pos.y + 1 });
        this.pushToStack(stack, { x: pos.x + 1, y: pos.y - 1 });
        this.pushToStack(stack, { x: pos.x + 1, y: pos.y });
        this.pushToStack(stack, { x: pos.x + 1, y: pos.y + 1 });
        this.pushToStack(stack, { x: pos.x - 1, y: pos.y - 1 });
        this.pushToStack(stack, { x: pos.x - 1, y: pos.y });
        this.pushToStack(stack, { x: pos.x - 1, y: pos.y + 1 });
    }

    private pushToStack(stack: Vec2[], pos: Vec2) {
        if (pos.x >= 0 && pos.x < this.height && pos.y >= 0 && pos.y < this.width) {
            stack.push(pos);
        }
    }

    private findDifference(differenceMatrix: number[][], coords: Vec2): number[][] {
        const difference: [number, number][] = [];
        const visited = this.createEmptyMatrix(differenceMatrix.length, differenceMatrix[0].length, 0);
        const directions = [
            [this.negativeDifferenceCoord, 0],
            [0, this.positiveDifferenceCoord],
            [this.positiveDifferenceCoord, 0],
            [0, this.negativeDifferenceCoord],
        ];

        const stack = [[coords.y, coords.x]];
        while (stack.length > 0) {
            const curr = stack.shift();
            if (!curr) continue;
            const [x, y] = curr;
            if (!visited[x][y]) {
                visited[x][y] = 1;
                difference.push([x, y]);
                for (const [dx, dy] of directions) {
                    const newCoords: Vec2 = { x: x + dx, y: y + dy };
                    this.addCoordOnValidValue(differenceMatrix, stack, newCoords);
                }
            }
        }
        return difference;
    }

    private addCoordOnValidValue(differenceMatrix: number[][], stack: number[][], coords: Vec2) {
        const nx = coords.x;
        const ny = coords.y;
        if (
            nx >= 0 &&
            nx < differenceMatrix.length &&
            ny >= 0 &&
            ny < differenceMatrix[0].length &&
            differenceMatrix[nx][ny] !== PossibleColor.EMPTYPIXEL
        ) {
            stack.push([nx, ny]);
        }
    }
}
