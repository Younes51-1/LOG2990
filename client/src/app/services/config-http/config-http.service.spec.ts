import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BestTime, GameHistory, NewBestTime } from '@app/interfaces/game';
import { GameConstants } from '@app/interfaces/game-constants';

import { ConfigHttpService } from './config-http.service';

describe('ConfigHttpService', () => {
    let httpMock: HttpTestingController;
    let service: ConfigHttpService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ConfigHttpService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    // TODO
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return all game histories when calling getHistory', () => {
        const expectedGameHistory: GameHistory[] = [getFakeGameHistory(), getFakeGameHistory2()];

        service.getHistory().subscribe({
            next: (response: GameHistory[]) => {
                expect(response).toEqual(expectedGameHistory);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/history`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGameHistory);
    });

    it('should handle http error safely when calling getHistory', () => {
        service.getHistory().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/history`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should return game constants when calling getConstants', () => {
        const expectedGameConstants: GameConstants = getInitConstants();

        service.getConstants().subscribe({
            next: (response: GameConstants) => {
                expect(response).toEqual(expectedGameConstants);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/constants`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGameConstants);
    });

    it('should handle http error safely when calling getConstants', () => {
        service.getConstants().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/constants`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should return game best times when calling getBestTime', () => {
        const expectedGameBestTime: { soloBestTimes: BestTime[]; vsBestTimes: BestTime[] } = {
            soloBestTimes: newBestTimes(),
            vsBestTimes: newBestTimes(),
        };
        const name = 'FakeGame';

        service.getBestTime(name).subscribe({
            next: (response: { soloBestTimes: BestTime[]; vsBestTimes: BestTime[] }) => {
                expect(response).toEqual(expectedGameBestTime);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/times/${name}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGameBestTime);
    });

    it('should handle http error safely when calling getBestTime', () => {
        const name = 'FakeGame';

        service.getBestTime(name).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/times/${name}`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should update the best time of game when calling updateBestTime', () => {
        const newBestTime = newFakeBestTime();
        const name = 'FakeGame';
        const position = 0; // premier des classements
        service.updateBestTime(name, newBestTime).subscribe({
            next: (response: number) => {
                expect(response).toEqual(position);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/times/${name}`);
        expect(req.request.method).toBe('PUT');
        req.flush(position);
    });

    it('should handle http error safely when calling updateBestTime', () => {
        const newBestTime = newFakeBestTime();
        const name = 'FakeGame';
        service.updateBestTime(name, newBestTime).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/config/times/${name}`);
        expect(req.request.method).toBe('PUT');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should update the game constants when calling updateConstants', () => {
        const newConstants = getInitConstants();
        service.updateConstants(newConstants).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/config/constants`);
        expect(req.request.method).toBe('PUT');
        req.flush({});
    });

    it('should delete the gameHistory when calling deleteHistory without id', () => {
        service.deleteHistory().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/config/history`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });

    it('should delete the all best times when calling deleteBestTimes', () => {
        service.deleteBestTimes().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/config/times`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });

    it('should delete the game best times when calling deleteBestTime', () => {
        const name = 'FakeGame';
        service.deleteBestTime(name).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/config/times/${name}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });
});

const getFakeGameHistory = (): GameHistory => ({
    name: 'FakeHistory',
    startTime: 0,
    timer: 4500,
    username1: 'FakeUser1',
    username2: undefined,
    gameMode: 'solo',
    abandonned: undefined,
    winner: 'FakeUser1',
});

const getFakeGameHistory2 = (): GameHistory => ({
    name: 'FakeHistory2',
    startTime: 0,
    timer: 380,
    username1: 'FakeUser1',
    username2: 'FakeUser2',
    gameMode: 'vs',
    abandonned: undefined,
    winner: 'FakeUser2',
});

const getInitConstants = (): GameConstants => ({
    initialTime: 30,
    penaltyTime: 5,
    bonusTime: 5,
});

const newBestTimes = (): BestTime[] => [
    { name: 'Player 1', time: 60 },
    { name: 'Player 2', time: 120 },
    { name: 'Player 3', time: 180 },
];

const newFakeBestTime = (): NewBestTime => ({ name: 'newBest', time: 1, gameName: 'FakeGame', isSolo: true });
