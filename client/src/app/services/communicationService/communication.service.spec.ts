import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from './communication.service';
import { Message } from '@common/message';
import { GameForm } from '@app/interfaces/game-form';
import { GameData } from '@app/interfaces/game-data';
import { NewGame } from '@app/interfaces/new-game';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
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

    it('should return expected message (HttpClient called once)', () => {
        const expectedMessage: Message = { body: 'Hello', title: 'World' };

        // check the content of the mocked call
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response.title).toEqual(expectedMessage.title);
                expect(response.body).toEqual(expectedMessage.body);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Message = { body: 'Hello', title: 'World' };
        // subscribe to the mocked call
        service.basicPost(sentMessage).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/example/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentMessage);
    });

    it('should handle http error safely', () => {
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should return all games when calling getAllGames', () => {
        const expectedGames: GameForm[] = [
            {
                name: 'Find the Differences 1',
                nbDifference: 10,
                image1url: 'https://example.com/image1.jpg',
                image2url: 'https://example.com/image2.jpg',
                difficulte: 'easy',
                soloBestTimes: [
                    { name: 'player1', time: 200 },
                    { name: 'player2', time: 150 },
                ],
                vsBestTimes: [{ name: 'player1', time: 200 }],
            },
            {
                name: 'Find the Differences 2',
                nbDifference: 15,
                image1url: 'https://example.com/image3.jpg',
                image2url: 'https://example.com/image4.jpg',
                difficulte: 'medium',
                soloBestTimes: [
                    { name: 'player3', time: 300 },
                    { name: 'player4', time: 250 },
                ],
                vsBestTimes: [{ name: 'player3', time: 200 }],
            },
        ];

        service.getAllGames().subscribe({
            next: (response: GameForm[]) => {
                expect(response).toEqual(expectedGames);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGames);
    });

    it('should return the game when calling getGame', () => {
        const gameForm: GameForm = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulte: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
            ],
            vsBestTimes: [{ name: 'player1', time: 200 }],
        };
        const differenceMatrix: number[][] = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const expectedGame: GameData = { gameForm, differenceMatrix };

        service.getGame(expectedGame.gameForm.name).subscribe({
            next: (response: GameData) => {
                expect(response).toEqual(expectedGame);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${expectedGame.gameForm.name}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGame);
    });

    it('should delete the game when calling deleteGame', () => {
        const gameForm: GameForm = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulte: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
            ],
            vsBestTimes: [{ name: 'player1', time: 200 }],
        };
        const differenceMatrix: number[][] = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const expectedGame: GameData = { gameForm, differenceMatrix };
        service.deleteGame(expectedGame.gameForm.name).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${expectedGame.gameForm.name}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(expectedGame);
    });

    it('should handle http error safely when calling getGame', () => {
        const gameForm: GameForm = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulte: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
            ],
            vsBestTimes: [{ name: 'player1', time: 200 }],
        };
        const differenceMatrix: number[][] = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const expectedGame: GameData = { gameForm, differenceMatrix };
        service.getGame(expectedGame.gameForm.name).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/${expectedGame.gameForm.name}`);
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
