import { TestBed } from '@angular/core/testing';
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
            [1, 0, 1],
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

    it('Difference Matrix should return 3 differences when given differents matrix and 0 in a radius', () => {
        const differencesCount = service.countDifferences(matrix, differentmatrix, 0);
        expect(differencesCount).toEqual(3);
    });

    it('Difference Matrix should return a correct matrix when given differents matrix and 0 in a radius', () => {
        const differenceMatrix = service.diffrencesMatrix(matrix, differentmatrix, 0);
        const matrixRes = [
            [emptyPixelValue, 0, emptyPixelValue],
            [emptyPixelValue, 0, emptyPixelValue],
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
            [1, 0, 1],
            [1, 0, 1],
        ];

        expect(differenceMatrix).toEqual(matrixRes);
    });
});
