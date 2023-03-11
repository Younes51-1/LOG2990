import { VerifyInputService } from './verify-input.service';

describe('VerifyInputService', () => {
    let service: VerifyInputService;

    beforeEach(() => {
        service = new VerifyInputService();
    });

    it('should return false when input contains zero-width characters', () => {
        const input = service.verify('hello​world');
        expect(input).toBe(false);
    });

    it('should return false when input is an empty string', () => {
        const input = service.verify('');
        expect(input).toBe(false);
    });

    it('should return false if input contains forbidden words', () => {
        const input = 'foo';
        expect(service.verify(input)).toBeFalse();
    });

    it('should return true when input is valid', () => {
        const input = service.verify('hello world');
        expect(input).toBe(true);
    });
});
