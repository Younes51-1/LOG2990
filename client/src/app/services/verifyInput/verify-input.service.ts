import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class VerifyInputService {
    verify(input: string): boolean {
        if (/[\u200B-\u200D\uFEFF]/.test(input)) {
            return false;
        }

        if (input.trim().length === 0) {
            return false;
        }
        // TODO: add more WORDS
        const forbiddenWords = ['foo', 'bar', 'baz'];
        for (const word of forbiddenWords) {
            if (input.toLowerCase() === word.toLowerCase()) {
                return false;
            }
        }
        return true;
    }
}
