import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameNameCreationService {
    private dataSubject = new Subject<string>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    data$ = this.dataSubject.asObservable();
    sendData(data: string) {
        this.dataSubject.next(data);
    }
}
