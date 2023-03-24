import { Injectable } from '@angular/core';
import { Constants } from 'src/assets/variables/constants';

@Injectable({
    providedIn: 'root',
})
export class VerifyInputService {
    verify(input: string | undefined): boolean {
        if (!input) return false;

        if (/[\u200B-\u200D\uFEFF]/.test(input)) {
            return false;
        }

        if (input.trim().length === 0) {
            return false;
        }

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

    verifyNumber(input: string, type: string): boolean {
        if (!input) return false;

        if (Number.isNaN(+input)) return false;

        switch (type) {
            case 'initialTime':
                return +input >= Constants.MinInitialTime && +input <= Constants.MaxInitialTime;
            case 'penaltyTime':
                return +input >= Constants.MinPenaltyTime && +input <= Constants.MaxPenaltyTime;
            case 'bonusTime':
                return +input >= Constants.MinBonusTime && +input <= Constants.MaxBonusTime;
            default:
                return false;
        }
    }
}
