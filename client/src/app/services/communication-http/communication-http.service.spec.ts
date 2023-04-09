import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameData, NewGame } from '@app/interfaces/game';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';

describe('CommunicationHttpService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationHttpService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationHttpService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return all games when calling getAllGames', () => {
        const expectedGames: GameData[] = [
            {
                name: 'Find the Differences 1',
                nbDifference: 10,
                image1url: 'https://example.com/image1.jpg',
                image2url: 'https://example.com/image2.jpg',
                difficulty: 'easy',
                soloBestTimes: [
                    { name: 'player1', time: 200 },
                    { name: 'player2', time: 150 },
                ],
                differenceMatrix: [[]],
                vsBestTimes: [{ name: 'player1', time: 200 }],
            },
            {
                name: 'Find the Differences 2',
                nbDifference: 15,
                image1url: 'https://example.com/image3.jpg',
                image2url: 'https://example.com/image4.jpg',
                difficulty: 'medium',
                soloBestTimes: [
                    { name: 'player3', time: 300 },
                    { name: 'player4', time: 250 },
                ],
                differenceMatrix: [[]],
                vsBestTimes: [{ name: 'player3', time: 200 }],
            },
        ];

        service.getAllGames().subscribe({
            next: (response: GameData[]) => {
                expect(response).toEqual(expectedGames);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGames);
    });

    it('should return the game when calling getGame', () => {
        const expectedGame: GameData = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulty: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
            ],
            differenceMatrix: [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            vsBestTimes: [{ name: 'player1', time: 200 }],
        };

        service.getGame(expectedGame.name).subscribe({
            next: (response: GameData) => {
                expect(response).toEqual(expectedGame);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${expectedGame.name}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGame);
    });

    it('should delete all the games when calling deleteAllGames', () => {
        service.deleteAllGames().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });

    it('should delete the game when calling deleteGame', () => {
        const expectedGame: GameData = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulty: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
            ],
            differenceMatrix: [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            vsBestTimes: [{ name: 'player1', time: 200 }],
        };
        service.deleteGame(expectedGame.name).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${expectedGame.name}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(expectedGame);
    });

    it('should handle http error safely when calling getGame', () => {
        const expectedGame: GameData = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulty: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
            ],
            differenceMatrix: [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            vsBestTimes: [{ name: 'player1', time: 200 }],
        };
        service.getGame(expectedGame.name).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${expectedGame.name}`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should handle http error safely when calling getAllGames', () => {
        service.getAllGames().subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should create a game when calling createGame', () => {
        const differenceMatrix: number[][] = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const expectedGame: NewGame = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1: 'https://example.com/image1.jpg',
            image2: 'https://example.com/image2.jpg',
            difficulty: 'facile',
            differenceMatrix,
        };

        service.createNewGame(expectedGame).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedGame);
    });
});
