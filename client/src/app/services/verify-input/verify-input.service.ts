import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class VerifyInputService {
    verify(input: string | undefined): boolean {
        if (input === undefined || input === null) return false;

        if (/[\u200B-\u200D\uFEFF]/.test(input)) {
            return false;
        }

        if (input.trim().length === 0) {
            return false;
        }
        // TODO: add more WORDS
        const forbiddenWords = [
            'fuck',
            'tabarnak',
            'shit',
            'merde',
            'criss',
            'calisse',
            'caliss',
            'esti',
            'osti',
            'putain',
            'marde',
            'nique',
            'ta gueule',
            'vas te faire foutre',
            'connard',
            'trou de cul',
            'enfoiré',
        ];
        for (const word of forbiddenWords) {
            if (input.toLowerCase().includes(word.toLowerCase())) {
                return false;
            }
        }
        return true;
    }
}
