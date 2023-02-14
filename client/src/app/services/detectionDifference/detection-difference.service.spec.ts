import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetectionDifferenceService } from './detection-difference.service';

describe('DetectionDifferenceService', () => {
    let service: DetectionDifferenceService;
    const emptyPixelValue = -1;
    let matrix: number[][];
    let differentmatrix: number[][];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DetectionDifferenceService);
        matrix = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ];

        differentmatrix = [
            [1, 0, 1],
            [1, 1, 1],
            [1, 0, 1],
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createEmptyMatix should return a new matrix', () => {
        const serviceMatrix = service.createEmptyMatrix(matrix.length, matrix[0].length, 1);
        expect(serviceMatrix).toBeTruthy();
    });

    it('createEmptyMatix should return a new matrix with dimensions equal to parametre', () => {
        const serviceMatrix = service.createEmptyMatrix(matrix.length, matrix[0].length, 1);
        expect(serviceMatrix.length).toEqual(matrix.length);
        expect(serviceMatrix[0].length).toEqual(matrix[0].length);
    });

    it("createEmptyMatix should return a new matrix equal to 'matrix' dimensions ", () => {
        const serviceMatrix = service.createEmptyMatrix(matrix.length, matrix[0].length, 1);
        expect(serviceMatrix).toEqual(matrix);
    });

    it('Difference Matrix should return 0 differences when given identical matrix', () => {
        const differencesCount = service.countDifferences(matrix, matrix, 0);
        expect(differencesCount).toEqual(0);
    });

    it('Difference Matrix should return an empty matrix when given identical matrix', () => {
        const differenceMatrix = service.diffrencesMatrix(matrix, matrix, 0);
        expect(differenceMatrix).toEqual(service.createEmptyMatrix(matrix.length, matrix[0].length, emptyPixelValue));
    });

    it('Difference Matrix should return 2 differences when given differents matrix and 0 in a radius', () => {
        const differencesCount = service.countDifferences(matrix, differentmatrix, 0);
        expect(differencesCount).toEqual(2);
    });

    it('Difference Matrix should return a correct matrix when given differents matrix and 0 in a radius', () => {
        const differenceMatrix = service.diffrencesMatrix(matrix, differentmatrix, 0);
        const matrixRes = [
            [emptyPixelValue, 0, emptyPixelValue],
            [emptyPixelValue, emptyPixelValue, emptyPixelValue],
            [emptyPixelValue, 0, emptyPixelValue],
        ];
        expect(differenceMatrix).toEqual(matrixRes);
    });

    it('Difference Matrix should return 1 differences when given differents matrix and 3 in a radius', () => {
        const differencesCount = service.countDifferences(matrix, differentmatrix, 3);
        expect(differencesCount).toEqual(1);
    });

    it('Difference Matrix should return a correct matrix when given differents matrix and 3 in a radius', () => {
        const differenceMatrix = service.diffrencesMatrix(matrix, differentmatrix, 3);
        const matrixRes = [
            [1, 0, 1],
            [1, 1, 1],
            [1, 0, 1],
        ];
        expect(differenceMatrix).toEqual(matrixRes);
    });

    it('should extract the current difference given a valid matrix and coordinates', () => {
        const differenceMatrix = [
            [1, emptyPixelValue, 1],
            [1, emptyPixelValue, 1],
            [emptyPixelValue, emptyPixelValue, 1],
        ];
        const expectedMatrix = [
            [1, emptyPixelValue, emptyPixelValue],
            [1, emptyPixelValue, emptyPixelValue],
            [emptyPixelValue, emptyPixelValue, emptyPixelValue],
        ];
        const result = service.extractDifference(differenceMatrix, 0, 0);
        expect(result).toEqual(expectedMatrix);
    });

    it('should return empty matrix from extractDifference given invalid coordinates', () => {
        const differenceMatrix = [
            [1, emptyPixelValue, 1],
            [1, emptyPixelValue, 1],
            [emptyPixelValue, emptyPixelValue, 1],
        ];
        const expectedMatrix = [
            [emptyPixelValue, emptyPixelValue, emptyPixelValue],
            [emptyPixelValue, emptyPixelValue, emptyPixelValue],
            [emptyPixelValue, emptyPixelValue, emptyPixelValue],
        ];
        const result = service.extractDifference(differenceMatrix, 1, 0);
        expect(result).toEqual(expectedMatrix);
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    it('should convert ArrayBuffer to Matrix', () => {
        const arrayBuffer = new ArrayBuffer(54);
        const dv = new DataView(arrayBuffer);
        dv.setInt16(0, 19778, true);
        dv.setUint32(2, 54, true);
        dv.setUint32(10, 54 - 14, true);
        dv.setUint32(14, 40, true);
        dv.setInt32(18, 2, true);
        dv.setInt32(22, 2, true);
        dv.setInt16(26, 1, true);
        dv.setInt16(28, 24, true);
        dv.setUint32(34, 16, true);
        dv.setUint8(54 - 16, 0);
        dv.setUint8(54 - 15, 0);
        dv.setUint8(54 - 14, 0);
        dv.setUint8(54 - 13, 0);
        dv.setUint8(54 - 12, 0);
        dv.setUint8(54 - 11, 0);
        dv.setUint8(54 - 10, 0);
        dv.setUint8(54 - 9, 0);
        dv.setUint8(54 - 8, 0);
        dv.setUint8(54 - 7, 0);
        dv.setUint8(54 - 6, 0);
        dv.setUint8(54 - 5, 0);

        const expectedMatrix = [
            [0, 0],
            [0, 0],
        ];
        const resultMatrix = service.convertImageToMatrix(arrayBuffer);
        expect(resultMatrix.length).toBe(2);
        expect(resultMatrix).toEqual(expectedMatrix);
    });
    /* eslint-enable @typescript-eslint/no-magic-numbers */

    it('should return easy if differences number lower than 7', () => {
        const diffuculte = service.computeLevelDifficulty(1, matrix);
        expect(diffuculte).toEqual('facile');
    });

    it('should return hard if criteria are met', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const diffMatrix = service.createEmptyMatrix(480, 640, emptyPixelValue);
        diffMatrix[0][0] = 1;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const diffuculte = service.computeLevelDifficulty(7, diffMatrix);
        expect(diffuculte).toEqual('difficile');
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    it('should create an image of differences', () => {
        const diffMatrix = [
            [0, 1, -1],
            [0, 0, 0],
            [-1, -1, -1],
        ];
        const canvasUrl = service.createDifferencesImage(diffMatrix);
        expect(canvasUrl).toBeDefined();
        expect(canvasUrl).toContain('data:image/png;base64');
    });
    /* eslint-enable @typescript-eslint/no-magic-numbers */

    it('should populate neighborhood', () => {
        const position = { i: 0, j: 0 };
        service.populateNeighborhood([matrix, differentmatrix], position, 3);
        expect(differentmatrix).toEqual(matrix);
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    it('should convert an image to a matrix', fakeAsync(() => {
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        const arrayBuffer = new ArrayBuffer(54);
        const dv = new DataView(arrayBuffer);
        dv.setInt16(0, 19778, true);
        dv.setUint32(2, 54, true);
        dv.setUint32(10, 54 - 14, true);
        dv.setUint32(14, 40, true);
        dv.setInt32(18, 2, true);
        dv.setInt32(22, 2, true);
        dv.setInt16(26, 1, true);
        dv.setInt16(28, 24, true);
        dv.setUint32(34, 16, true);
        dv.setUint8(54 - 16, 0);
        dv.setUint8(54 - 15, 0);
        dv.setUint8(54 - 14, 0);
        dv.setUint8(54 - 13, 0);
        dv.setUint8(54 - 12, 0);
        dv.setUint8(54 - 11, 0);
        dv.setUint8(54 - 10, 0);
        dv.setUint8(54 - 9, 0);
        dv.setUint8(54 - 8, 0);
        dv.setUint8(54 - 7, 0);
        dv.setUint8(54 - 6, 0);
        dv.setUint8(54 - 5, 0);
        const bmpFile = new File([arrayBuffer], 'test.bmp', { type: 'image/bmp' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileList = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            0: bmpFile,
            length: 1,
            // eslint-disable-next-line no-unused-vars
            item: (index: number) => bmpFile,
        };
        Object.defineProperty(inputElement, 'files', {
            value: fileList,
        });
        let result: number[][];
        service.readThenConvertImage(inputElement).then((data) => {
            result = data;
            expect(result).toBeDefined();
        });
        tick();
    }));

    it('should return null if the image is a null', fakeAsync(() => {
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        Object.defineProperty(inputElement, 'files', {
            value: null,
        });
        let result: number[][] | null;
        service.readThenConvertImage(inputElement).then((data) => {
            result = data;
            expect(result).toBeUndefined();
        });
        tick();
    }));
});
