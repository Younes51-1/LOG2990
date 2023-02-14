import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameData } from '@app/interfaces/game-data';
import { GameForm } from '@app/interfaces/game-form';
import { NewGame } from '@app/interfaces/new-game';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }

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
