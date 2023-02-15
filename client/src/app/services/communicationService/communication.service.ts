import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameData, GameForm, NewGame } from '@app/interfaces/game';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getAllGames(): Observable<GameForm[]> {
        return this.http.get<GameForm[]>(`${this.baseUrl}/game`).pipe(catchError(this.handleError<GameForm[]>('getGames')));
    }

    getGame(name: string): Observable<GameData> {
        return this.http.get<GameData>(`${this.baseUrl}/game/${name}`).pipe(catchError(this.handleError<GameData>('getGame')));
    }

    createNewGame(newGame: NewGame): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game`, newGame, { observe: 'response', responseType: 'text' });
    }

    deleteGame(name: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/${name}`, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
