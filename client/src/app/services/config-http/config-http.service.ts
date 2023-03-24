import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '@app/interfaces/constants';
import { BestTime, GameHistory } from '@app/interfaces/game';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryHttpService {
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient) {}

    getHistory(): Observable<GameHistory[]> {
        return this.http.get<GameHistory[]>(`${this.baseUrl}/config/history`).pipe(catchError(this.handleError<GameHistory[]>('getHistory')));
    }

    getConstants(): Observable<Constants> {
        return this.http.get<Constants>(`${this.baseUrl}/config/constants`).pipe(catchError(this.handleError<Constants>('getConstants')));
    }

    updateBestTime(name: string, bestTimes: BestTime[]): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/config/times/${name}`, bestTimes, { observe: 'response', responseType: 'text' });
    }

    updateConstants(constants: Constants): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/config/constants`, constants, { observe: 'response', responseType: 'text' });
    }

    deleteHistory(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/config/history`, { observe: 'response', responseType: 'text' });
    }

    deleteBestTimes(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/config/times`, { observe: 'response', responseType: 'text' });
    }

    deleteBestTime(name: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/config/times/${name}`, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
