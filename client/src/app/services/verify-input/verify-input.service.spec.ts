import { VerifyInputService } from '@app/services/verify-input/verify-input.service';

describe('VerifyInputService', () => {
    let service: VerifyInputService;

    beforeEach(() => {
        service = new VerifyInputService();
    });

    it('should return false when verify input is undefined in verify', () => {
        const output = service.verify(undefined);
        expect(output).toBe(false);
    });

    it('should return false when verify input contains zero-width characters in verify', () => {
        const output = service.verify('hello​world');
        expect(output).toBe(false);
    });

    it('should return false when verify input is an empty string', () => {
        const output = service.verify(' ');
        expect(output).toBe(false);
    });

    it('should return false if verify input contains forbidden words', () => {
        const output = 'hello connard';
        expect(service.verify(output)).toBe(false);
    });

    it('should return true when verify input is valid', () => {
        const output = service.verify('hello world');
        expect(output).toBe(true);
    });

    it('should return true when verifyNotNumber contains a non number', () => {
        const output = service.verifyNotNumber('5a');
        expect(output).toBe(true);
    });

    it('should return false when verifyNotNumber contains only numbers', () => {
        const output = service.verifyNotNumber('5');
        expect(output).toBe(false);
    });

    it('should return false when verifyConstantsInBounds input is undefined', () => {
        const output = service.verifyConstantsInBounds(undefined, 'undefined');
        expect(output).toBe(false);
    });

    it('should return false when verifyConstantsInBounds input contains zero-width characters', () => {
        const output = service.verifyConstantsInBounds(+'5​5', 'initialTime');
        expect(output).toBe(false);
    });

    it('should return true when verifyConstantsInBounds input is valid', () => {
        const ten = 10;
        const output = service.verifyConstantsInBounds(ten, 'penaltyTime');
        expect(output).toBe(true);
    });

    it('should return false when verifyConstantsInBounds is called with an unknown type', () => {
        const output = service.verifyConstantsInBounds(1, 'Samuel Pierre');
        expect(output).toBe(false);
    });
});
