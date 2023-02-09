import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DifferencesFoundService {
    differencesFound$ = new Subject<number>();
    private differencesFound = 0;

    updateDifferencesFound(count: number) {
        this.differencesFound = count;
        this.differencesFound$.next(this.differencesFound);
    }

    getDifferencesFound() {
        return this.differencesFound;
    }

    resetDifferencesFound() {
        this.differencesFound = 0;
    }
}
