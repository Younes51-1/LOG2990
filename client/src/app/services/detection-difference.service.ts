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

const emptyPixelValue = -1;

@Injectable({
    providedIn: 'root',
})
export class DetectionDifferenceService {
    pictureDimensions = { width: 640, height: 480 };
    element: HTMLImageElement;

    createEmptyMatrix(height: number, width: number, filler: number | boolean) {
        const matrix = [];
        for (let i = 0; i < height; i++) {
            matrix[i] = new Array(width).fill(filler);
        }
        return matrix;
    }

    convertImageToMatrix(buffer: ArrayBuffer): number[][] {
        const offset = new DataView(buffer).getInt32(OffsetValues.OFFSET, true);
        const width = new DataView(buffer).getInt32(OffsetValues.WIDTH, true);
        const height = new DataView(buffer).getInt32(OffsetValues.HEIGHT, true);

        const matrix = this.createEmptyMatrix(height, width, emptyPixelValue);

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const index = offset + (width * (height - i - 1) + j) * 3;
                matrix[i][j] = new Uint8Array(buffer, index, 1)[0];
            }
        }

        return matrix;
    }

    readThenConvertImage() {
        const input: HTMLInputElement | null = document.querySelector('input[type=file]');
        const file: File | null = input !== null && input.files !== null ? input.files[0] : null;
        const reader: FileReader = new FileReader();

        reader.addEventListener(
            'loadend',
            () => {
                return this.convertImageToMatrix(reader.result as ArrayBuffer);
            },
            false,
        );
        if (file) {
            reader.readAsArrayBuffer(file);
        }
    }

    populateNeighborhood(array: number[][], visited: boolean[][], values: [i: number, j: number, radius: number, value: number]) {
        const [i, j, radius, value] = values;
        if (i < 0 || i >= array.length || j < 0 || j >= array[i].length || visited[i][j] || array[i][j] === emptyPixelValue) return;

        visited[i][j] = true;
        for (let k = i - radius; i <= i + radius; k++) {
            for (let l = j - radius; j <= j + radius; l++) {
                this.populateNeighborhood(array, visited, [k, l, radius, value]);
            }
        }
    }

    diffrencesMatrix(array1: number[][], array2: number[][], radius: number): { differenceMatrix: number[][]; differenceCount: number } {
        const differenceMatrix = this.createEmptyMatrix(array1.length, array1[0].length, emptyPixelValue);
        let differenceCount = 0;
        const visited = this.createEmptyMatrix(array1.length, array1[0].length, false);
        for (let i = 0; i < array1.length; i++) {
            for (let j = 0; j < array1[i].length; j++) {
                if (array1[i][j] !== array2[i][j] && !visited[i][j]) {
                    differenceCount++;
                    differenceMatrix[i][j] = array2[i][j];
                    this.populateNeighborhood(differenceMatrix, visited, [i, j, radius, array2[i][j]]);
                }
            }
        }

        return { differenceMatrix, differenceCount };
    }

    computeLevelDifficulty(nDifferences: number, blackAndWhiteMapPath) {
        if(nDifferences < 7) { return "facile "}

        // let canvas : HTMLCanvasElement = document.createElement("canvas");
        // let context = canvas.getContext('2d');
        // context?.drawImage(blackAndWhiteMapPath, 0, 0);
        // let data = context?.getImageData(0, 0, this.pictureDimensions.height, this.pictureDimensions.width);
        // let pixels : Array<Array<String>> = new Array();

        // let whiteCounter = 0;
        // for pixel in pixels {
        //     if (pixel is white) {
        //         blackCounter++;
        //     }
        // }
        
        // const surfaceCovered : number = whiteCounter/ (this.pictureDimensions.height * this.pictureDimensions.width);
        // if (surfaceCovered > 0.15) {
        //     return "facile";
        // } else {
        //     return "difficile";
        // }
        return 0;
    }
}
