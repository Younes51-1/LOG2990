import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { DetectionDifferenceService } from '@app/services/detectionDifference/detection-difference.service';

describe('DetectionDifferenceService', () => {
    let service: DetectionDifferenceService;
    const emptyPixelValue = -1;
    const width = 640;
    const height = 480;
    let matrix: number[][];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DetectionDifferenceService);
        matrix = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
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

    it('difference matrix should be filled with emptyPixelValue if there is no difference', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const context1 = canvas1.getContext('2d');
        const context2 = canvas2.getContext('2d');
        if (context1 && context2) {
            context1.fillStyle = 'black';
            context2.fillStyle = 'black';
            const randomValue = 100;
            context1.fillRect(randomValue, randomValue, randomValue, randomValue);
            context2.fillRect(randomValue, randomValue, randomValue, randomValue);
            const diffMatrix = service.generateDifferencesMatrix(context1, context2, 3);
            const emptyMatrix = service.createEmptyMatrix(height, width, emptyPixelValue);
            expect(diffMatrix).toEqual(emptyMatrix);
        }
    });

    it('difference matrix should have value 1 if pixels are different', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const context1 = canvas1.getContext('2d');
        const context2 = canvas2.getContext('2d');
        if (context1 && context2) {
            context1.fillStyle = 'black';
            context2.fillStyle = 'black';
            const randomValue = 100;
            context1.fillRect(randomValue, randomValue, randomValue, randomValue);
            context2.fillRect(randomValue, randomValue, randomValue, randomValue);
            context1.fillStyle = 'red';
            context1.fillRect(1, 1, 1, 1); // difference
            const diffMatrix = service.generateDifferencesMatrix(context1, context2, 0);
            const emptyMatrix = service.createEmptyMatrix(height, width, emptyPixelValue);
            emptyMatrix[1][1] = 1;
            expect(diffMatrix).toEqual(emptyMatrix);
        }
    });

    it('difference matrix should take radius into account', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const context1 = canvas1.getContext('2d');
        const context2 = canvas2.getContext('2d');
        const spy = spyOn(service, 'applyRadius');
        if (context1 && context2) {
            service.generateDifferencesMatrix(context1, context2, 3);
            expect(spy).toHaveBeenCalled();
        }
    });

    it('should apply radius correctly', () => {
        const spy = spyOn(service, 'computeRadiusRelativeCoordinates').and.callThrough();
        const initialMatrix = [
            [emptyPixelValue, 1, emptyPixelValue],
            [emptyPixelValue, emptyPixelValue, emptyPixelValue],
            [emptyPixelValue, emptyPixelValue, emptyPixelValue],
        ];
        const radius = 2;
        const diffCoordinates = [0, 1];
        const matrixAfterRadius = service.applyRadius(initialMatrix, radius, diffCoordinates);
        const expectedMatrix = [
            [1, 1, 1],
            [1, 1, 1],
            [emptyPixelValue, 1, emptyPixelValue],
        ];
        expect(matrixAfterRadius).toEqual(expectedMatrix);
        expect(spy).toHaveBeenCalledWith(radius);
    });

    it('should compare rgba values correctly', () => {
        let rgba1 = { r: 0, g: 0, b: 0, a: 0 };
        const rgba2 = { r: 0, g: 0, b: 0, a: 0 };
        const result1 = service.areEqual(rgba1, rgba2);
        expect(result1).toBeTruthy();
        rgba1 = { r: 1, g: 0, b: 0, a: 0 };
        const result2 = service.areEqual(rgba1, rgba2);
        expect(result2).toBeFalsy();
    });

    it('should count the number of differences correctly', () => {
        const diffMatrix = service.createEmptyMatrix(height, width, emptyPixelValue);
        diffMatrix[1][1] = 1; // first difference
        diffMatrix[1][2] = 1; // should be counted as the same difference
        diffMatrix[5][2] = 1; // second difference
        const nDiff = service.countDifferences(diffMatrix);
        expect(nDiff).toEqual(2);
    });

    it('should delete the difference', () => {
        const diffMatrix = service.createEmptyMatrix(height, width, emptyPixelValue);
        diffMatrix[1][1] = 1;
        const referenceMatrix = service.copyMatrix(diffMatrix);
        diffMatrix[100][1] = 1;
        diffMatrix[100][2] = 1; // adding a difference
        service.deleteDifference(diffMatrix, { x: 100, y: 1 }); // deleting it
        expect(diffMatrix).toEqual(referenceMatrix);
    });

    it('should push neighbors to stack', () => {
        const stack: Vec2[] = [];
        const pos = { x: 1, y: 1 };
        const spy = spyOn(service, 'pushToStack');
        service.pushNeighborsToStack(stack, pos);
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x, y: pos.y - 1 });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x, y: pos.y + 1 });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x + 1, y: pos.y - 1 });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x + 1, y: pos.y });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x + 1, y: pos.y + 1 });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x - 1, y: pos.y - 1 });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x - 1, y: pos.y });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x - 1, y: pos.y + 1 });
        const nNeighbors = 8;
        expect(spy).toHaveBeenCalledTimes(nNeighbors);
    });

    it('should push to stack if pos is valid', () => {
        const stack: Vec2[] = [];
        const pos = { x: 1, y: 1 };
        const spy = spyOn(stack, 'push');
        service.pushToStack(stack, pos);
        expect(spy).toHaveBeenCalledWith(pos);
    });

    it('should not push to stack if pos is not valid', () => {
        const stack: Vec2[] = [];
        const pos = { x: 648, y: 1 };
        const spy = spyOn(stack, 'push');
        service.pushToStack(stack, pos);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should copy matrix', () => {
        const matrix1 = service.createEmptyMatrix(height, width, 1);
        const copyMatrix = service.copyMatrix(matrix1);
        expect(copyMatrix).toEqual(matrix1);
        copyMatrix[0][0] = emptyPixelValue;
        expect(copyMatrix).not.toEqual(matrix1);
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
});
