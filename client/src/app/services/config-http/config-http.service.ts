import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '@app/interfaces/constants';
import { GameHistory, NewBestTime } from '@app/interfaces/game';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ConfigHttpService {
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient) {}

    getHistory(): Observable<GameHistory[]> {
        return this.http.get<GameHistory[]>(`${this.baseUrl}/config/history`).pipe(catchError(this.handleError<GameHistory[]>('getHistory')));
    }

    getConstants(): Observable<Constants> {
        return this.http.get<Constants>(`${this.baseUrl}/config/constants`).pipe(catchError(this.handleError<Constants>('getConstants')));
    }

    updateBestTime(name: string, newBestTime: NewBestTime): Observable<number> {
        return this.http
            .put<number>(`${this.baseUrl}/config/times/${name}`, newBestTime)
            .pipe(catchError(this.handleError<number>('updateBestTime')));
    }

    updateConstants(constants: Constants): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/config/constants`, constants, { observe: 'response', responseType: 'text' });
    }

    deleteHistory(id?: string): Observable<HttpResponse<string>> {
        if (id) {
            return this.http.delete(`${this.baseUrl}/config/history/${id}`, { observe: 'response', responseType: 'text' });
        } else {
            return this.http.delete(`${this.baseUrl}/config/history`, { observe: 'response', responseType: 'text' });
        }
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
