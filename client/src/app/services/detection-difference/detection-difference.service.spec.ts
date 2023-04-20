/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';

describe('DetectionDifferenceService', () => {
    let service: DetectionDifferenceService;
    const EMPTYPIXELValue = -1;
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

    it('difference matrix should be filled with EMPTYPIXELValue if there is no difference', () => {
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
            const emptyMatrix = (service as any).createEmptyMatrix(height, width, EMPTYPIXELValue);
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
            const emptyMatrix = (service as any).createEmptyMatrix(height, width, EMPTYPIXELValue);
            emptyMatrix[1][1] = 1;
            expect(diffMatrix).toEqual(emptyMatrix);
        }
    });

    it('difference matrix should take radius into account', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const context1 = canvas1.getContext('2d');
        const context2 = canvas2.getContext('2d');
        const spy = spyOn(service as any, 'applyRadius');
        if (context1 && context2) {
            service.generateDifferencesMatrix(context1, context2, 3);
            expect(spy).toHaveBeenCalled();
        }
    });

    it('should count the number of differences correctly', () => {
        const diffMatrix = (service as any).createEmptyMatrix(height, width, EMPTYPIXELValue);
        diffMatrix[1][1] = 1; // first difference
        diffMatrix[1][2] = 1; // should be counted as the same difference
        diffMatrix[5][2] = 1; // second difference
        const nDiff = service.countDifferences(diffMatrix);
        expect(nDiff).toEqual(2);
    });

    it('should create an image of differences', () => {
        const diffMatrix = [
            [0, 1, EMPTYPIXELValue],
            [0, 0, 0],
            [EMPTYPIXELValue, EMPTYPIXELValue, EMPTYPIXELValue],
        ];
        const canvasUrl = service.createDifferencesImage(diffMatrix);
        expect(canvasUrl).toBeDefined();
        expect(canvasUrl).toContain('data:image/png;base64');
    });

    it('should return an empty string when ctx is null', () => {
        spyOn(window.HTMLCanvasElement.prototype, 'getContext').and.callFake(() => {
            return null;
        });
        const differenceMatrix = [
            [1, 0],
            [0, 1],
        ];
        const result = service.createDifferencesImage(differenceMatrix);
        expect(result).toBe('');
    });

    it('should return easy if differences number lower than 7', () => {
        const difficulty = service.computeLevelDifficulty(1, matrix);
        expect(difficulty).toEqual('facile');
    });

    it('should return easy if surface covered by differences is bigger than 0,15', () => {
        const diffMatrix = (service as any).createEmptyMatrix(height, width, 0);
        const nbDifferences = 7;
        const difficulty = service.computeLevelDifficulty(nbDifferences, diffMatrix);
        expect(difficulty).toEqual('facile');
    });

    it('should return hard if criteria are met', () => {
        const diffMatrix = (service as any).createEmptyMatrix(height, width, EMPTYPIXELValue);
        diffMatrix[0][0] = 1;
        const nbDifferences = 7;
        const difficulty = service.computeLevelDifficulty(nbDifferences, diffMatrix);
        expect(difficulty).toEqual('difficile');
    });

    it('should return empty matrix from extractDifference given invalid coordinates', () => {
        const differenceMatrix = [
            [1, EMPTYPIXELValue, 1],
            [1, EMPTYPIXELValue, 1],
            [EMPTYPIXELValue, EMPTYPIXELValue, 1],
        ];
        const expectedMatrix = service.createEmptyMatrix(3, 3, EMPTYPIXELValue);
        const result = service.extractDifference(differenceMatrix, { x: 1, y: 0 });
        expect(result).toEqual(expectedMatrix);
    });

    it('should extract the current difference given a valid matrix and coordinates', () => {
        const differenceMatrix = [
            [1, EMPTYPIXELValue, 1],
            [1, EMPTYPIXELValue, 1],
            [EMPTYPIXELValue, EMPTYPIXELValue, 1],
        ];
        const expectedMatrix = [
            [1, EMPTYPIXELValue, EMPTYPIXELValue],
            [1, EMPTYPIXELValue, EMPTYPIXELValue],
            [EMPTYPIXELValue, EMPTYPIXELValue, EMPTYPIXELValue],
        ];
        const result = service.extractDifference(differenceMatrix, { x: 0, y: 0 });
        expect(result).toEqual(expectedMatrix);
    });

    it('should return null if shift() returns undefined', () => {
        spyOn(window.Array.prototype, 'shift').and.callFake(() => {
            window.Array.prototype.length = 0;
            return undefined;
        });
        const difference = (service as any).findRandomDifference(matrix);
        expect(difference).toBeNull();
    });

    it('should return null if no difference is found', () => {
        const emptyMatrix = service.createEmptyMatrix(3, 3, EMPTYPIXELValue);
        const randomDiff = service.findRandomDifference(emptyMatrix);
        expect(randomDiff).toBeNull();
    });

    it('should return a random difference', () => {
        const differenceMatrix = [
            [EMPTYPIXELValue, EMPTYPIXELValue, EMPTYPIXELValue],
            [EMPTYPIXELValue, 1, EMPTYPIXELValue],
            [EMPTYPIXELValue, EMPTYPIXELValue, EMPTYPIXELValue],
        ];
        const randomDiff = service.findRandomDifference(differenceMatrix);
        expect(randomDiff).toEqual({ x: 1, y: 1 });
    });

    it('createEmptyMatrix should return a new matrix', () => {
        const serviceMatrix = (service as any).createEmptyMatrix(matrix.length, matrix[0].length, 1);
        expect(serviceMatrix).toBeTruthy();
    });

    it('createEmptyMatrix should return a new matrix with dimensions equal to specified parameters', () => {
        const serviceMatrix = (service as any).createEmptyMatrix(matrix.length, matrix[0].length, 1);
        expect(serviceMatrix.length).toEqual(matrix.length);
        expect(serviceMatrix[0].length).toEqual(matrix[0].length);
    });

    it("createEmptyMatrix should return a new matrix equal to 'matrix' dimensions ", () => {
        const serviceMatrix = (service as any).createEmptyMatrix(matrix.length, matrix[0].length, 1);
        expect(serviceMatrix).toEqual(matrix);
    });

    it('should apply radius correctly', () => {
        const spy = spyOn(service as any, 'computeRadiusRelativeCoordinates').and.callThrough();
        const initialMatrix = [
            [EMPTYPIXELValue, 1, EMPTYPIXELValue],
            [EMPTYPIXELValue, EMPTYPIXELValue, EMPTYPIXELValue],
            [EMPTYPIXELValue, EMPTYPIXELValue, EMPTYPIXELValue],
        ];
        const radius = 2;
        const diffCoordinates = [0, 1];
        const matrixAfterRadius = (service as any).applyRadius(initialMatrix, radius, diffCoordinates);
        const expectedMatrix = [
            [1, 1, 1],
            [1, 1, 1],
            [EMPTYPIXELValue, 1, EMPTYPIXELValue],
        ];
        expect(matrixAfterRadius).toEqual(expectedMatrix);
        expect(spy).toHaveBeenCalledWith(radius);
    });

    it('should compute radius relative coordinates correctly', () => {
        const radius = 1;
        const result = (service as any).computeRadiusRelativeCoordinates(radius);
        const expectedResult = [EMPTYPIXELValue, 0, 0, EMPTYPIXELValue, 0, 0, 0, 1, 1, 0];
        expect(result).toEqual(expectedResult);
    });

    it('should compare rgba values correctly', () => {
        let rgba1 = { r: 0, g: 0, b: 0, a: 0 };
        const rgba2 = { r: 0, g: 0, b: 0, a: 0 };
        const result1 = (service as any).areEqual(rgba1, rgba2);
        expect(result1).toBeTruthy();
        rgba1 = { r: 1, g: 0, b: 0, a: 0 };
        const result2 = (service as any).areEqual(rgba1, rgba2);
        expect(result2).toBeFalsy();
    });

    it('should delete the difference', () => {
        const diffMatrix = (service as any).createEmptyMatrix(height, width, EMPTYPIXELValue);
        diffMatrix[1][1] = 1;
        const referenceMatrix = JSON.parse(JSON.stringify(diffMatrix));
        diffMatrix[100][1] = 1;
        diffMatrix[100][2] = 1; // adding a difference
        (service as any).deleteDifference(diffMatrix, { x: 100, y: 1 }); // deleting it
        expect(diffMatrix).toEqual(referenceMatrix);
    });

    it('should push neighbors to stack', () => {
        const stack: Vec2[] = [];
        const pos = { x: 1, y: 1 };
        const spy = spyOn(service as any, 'pushToStack');
        (service as any).pushNeighborsToStack(stack, pos);
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x, y: pos.y - 1 });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x, y: pos.y + 1 });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x + 1, y: pos.y });
        expect(spy).toHaveBeenCalledWith(stack, { x: pos.x - 1, y: pos.y });
        const nNeighbors = 4;
        expect(spy).toHaveBeenCalledTimes(nNeighbors);
    });

    it('should push to stack if pos is valid', () => {
        const stack: Vec2[] = [];
        const pos = { x: 1, y: 1 };
        const spy = spyOn(stack, 'push');
        (service as any).pushToStack(stack, pos);
        expect(spy).toHaveBeenCalledWith(pos);
    });

    it('should not push to stack if pos is not valid', () => {
        const stack: Vec2[] = [];
        const pos = { x: 648, y: 1 };
        const spy = spyOn(stack, 'push');
        (service as any).pushToStack(stack, pos);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should return empty difference if shift() returns undefined', () => {
        spyOn(window.Array.prototype, 'shift').and.callFake(() => {
            window.Array.prototype.length = 0;
            return undefined;
        });
        const difference = (service as any).findDifference(matrix, { x: 1, y: 1 });
        expect(difference).toEqual([]);
    });

    it('should add coord on valid value', () => {
        const stack: number[][] = [];
        (service as any).addCoordOnValidValue(matrix, stack, { x: 1, y: 1 });
        expect(stack).toEqual([[1, 1]]);
    });
});
