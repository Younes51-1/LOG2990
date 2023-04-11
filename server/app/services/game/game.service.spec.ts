/* eslint-disable max-lines */
import { DELAY_BEFORE_CLOSING_CONNECTION, NOT_TOP3 } from '@app/constants';
import { environment } from '@app/environments/environment';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameModeGateway } from '@app/gateways/game-mode/game-mode.gateway';
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { GameData } from '@app/model/dto/game/game-data.dto';
import { NewBestTime } from '@app/model/dto/game/new-best-times.dto';
import { BestTime } from '@app/model/schema/best-times.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameService } from '@app/services/game/game.service';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let gameModeGateway: SinonStubbedInstance<GameModeGateway>;
    let chatGateway: SinonStubbedInstance<ChatGateway>;
    let gameHistoryService: SinonStubbedInstance<GameHistoryService>;
    // eslint-disable-next-line no-unused-vars
    const timeoutTime = 1000;

    beforeEach(async () => {
        gameModeGateway = createStubInstance(GameModeGateway);
        chatGateway = createStubInstance(ChatGateway);
        mongoServer = await MongoMemoryServer.create();
        gameHistoryService = createStubInstance(GameHistoryService);
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                    imports: undefined,
                }),
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [
                GameService,
                {
                    provide: GameModeGateway,
                    useValue: gameModeGateway,
                },
                {
                    provide: ChatGateway,
                    useValue: chatGateway,
                },
                {
                    provide: GameHistoryService,
                    useValue: gameHistoryService,
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        // The database get auto populated in the constructor
        // We want to make sur we close the connection after the database got
        // populated. So we add small delay
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    // TODO: Fix this test
    it('getAllGames should return all games in database', async () => {
        jest.spyOn(service, 'getMatrix').mockImplementation(async () => Promise.resolve([]));
        await gameModel.deleteMany({});
        expect(await service.getAllGames()).toEqual([]);
        const game = getFakeGame();
        await gameModel.create(game);
        expect((await service.getAllGames()).length).toEqual(1);
    });

    it('createNewGame should add the game to the DB', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGameData();
        await service.createNewGame({
            name: game.name,
            nbDifference: game.nbDifference,
            difficulty: game.difficulty,
            image1: '...',
            image2: '...',
            differenceMatrix: game.differenceMatrix,
        });
        expect(await gameModel.countDocuments()).toEqual(1);
    });

    it('createNewGame should not add game if the database throw an error', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        await gameModel.deleteMany({});
        const game = getFakeGameData();
        await expect(
            service.createNewGame({
                name: game.name,
                nbDifference: game.nbDifference,
                difficulty: game.difficulty,
                image1: '...',
                image2: '...',
                differenceMatrix: game.differenceMatrix,
            }),
        ).rejects.toBeTruthy();
    });

    it('createNewGame should fail if fs.write of saveImage fails', async () => {
        jest.spyOn(service, 'saveImage').mockImplementation(async () => Promise.reject(''));
        await gameModel.deleteMany({});
        const game = getFakeGameData();
        await expect(
            service.createNewGame({
                name: game.name,
                nbDifference: game.nbDifference,
                difficulty: game.difficulty,
                image1: '...',
                image2: '...',
                differenceMatrix: game.differenceMatrix,
            }),
        ).rejects.toBeTruthy();
    });

    // TODO: Fix this test
    // it('getGame should return undefined if the game with the specified subject code does not exist', async () => {
    //     expect(await service.getGame('FakeGame')).toEqual({});
    // });

    it('getGame should return the game with the specified name', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.getGame(game.name)).toEqual(expect.objectContaining(getFakeGameData()));
    });

    it('getBestTime should return the best times of the game for solo and vs', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.getBestTime(game.name)).toEqual({
            soloBestTimes: game.soloBestTimes,
            vsBestTimes: game.vsBestTimes,
        });
    });

    it('getBestTime should return undefined if the game doesnt exist', async () => {
        expect(await service.getBestTime('FakeGame')).toEqual(undefined);
    });

    it('getMatrix should reject if file directory does not exist', async () => {
        await expect(service.getMatrix('WrongPathGame')).rejects.toBeTruthy();
    });

    it('saveMatrix should create new directory if directory does not exist', async () => {
        const game = getFakeGameData();
        expect(fs.existsSync('./assets/WrongPathGame')).toBeFalsy();
        service.saveMatrix({
            name: 'WrongPathGame',
            nbDifference: game.nbDifference,
            difficulty: game.difficulty,
            image1: '...',
            image2: '...',
            differenceMatrix: game.differenceMatrix,
        });
        expect(fs.existsSync('./assets/WrongPathGame')).toBeTruthy();
        fs.rmSync('./assets/WrongPathGame', { recursive: true });
    });

    it('calculateDifficulty should return the correct difficulty', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame2();
        await gameModel.create(game);
        const getGame = await service.getGame(game.name);
        expect(getGame.difficulty).toEqual('difficile');
    });

    it('deleteGame should delete the game', async () => {
        jest.spyOn(gameModeGateway, 'cancelDeletedGame').mockImplementation();
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await gameModel.create(game);
        await service.deleteGame(game.name);
        expect(await gameModel.countDocuments()).toEqual(0);
        expect(gameModeGateway.cancelDeletedGame).toHaveBeenCalledWith(game.name);
    });

    it('deleteGame should fail if the game does not exist', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await expect(service.deleteGame(game.name)).rejects.toBeTruthy();
    });

    // it('deleteGame should fail if mongo query failed', async () => {
    //     jest.spyOn(gameModel, 'deleteOne').mockRejectedValue('');
    //     const game = getFakeGame();
    //     expect(await service.deleteGame(game.name)).rejects.toBeTruthy();
    // });

    it('deleteAllGames should delete all games', async () => {
        jest.spyOn(gameModeGateway, 'cancelDeletedGame').mockImplementation();
        await gameModel.deleteMany({});
        await gameModel.create(getFakeGame());
        await service.deleteAllGames();
        expect(gameModel.countDocuments()).resolves.toEqual(0);
    });

    // it('deleteAllGames should fail if mongo query failed', async () => {
    //     jest.spyOn(gameModeGateway, 'cancelDeletedGame').mockImplementation();
    //     await gameModel.deleteMany({});
    //     await gameModel.create(getFakeGame());
    //     jest.spyOn(gameModel, 'deleteOne').mockRejectedValue('');
    //     await expect(await service.deleteAllGames()).rejects.toBeTruthy();
    // });

    it('deleteBestTimes should reset to default values bestTimes of every games', async () => {
        jest.spyOn(service, 'getMatrix').mockImplementation(async () => Promise.resolve([]));
        await gameModel.deleteMany({});
        const game1 = getFakeGame();
        const game2 = getFakeGame2();
        game1.soloBestTimes = [
            { name: 'newBest', time: 1 },
            { name: 'secondBest', time: 3 },
            { name: 'Player 3', time: 180 },
        ];
        game2.soloBestTimes = [
            { name: 'newBest', time: 3 },
            { name: 'secondBest', time: 5 },
            { name: 'Player 3', time: 180 },
        ];
        game1.vsBestTimes = [
            { name: 'newBest', time: 1 },
            { name: 'Player 2', time: 120 },
            { name: 'Player 3', time: 180 },
        ];
        await gameModel.create(game1);
        await gameModel.create(game2);
        await service.deleteBestTimes();
        await new Promise((resolve) => setTimeout(resolve, timeoutTime));
        const gamesUpdated = await service.getAllGames();
        expect(gamesUpdated[0].soloBestTimes).toEqual([]);
        expect(gamesUpdated[1].soloBestTimes).toEqual([]);
        expect(gamesUpdated[0].vsBestTimes).toEqual([]);
        expect(gamesUpdated[1].vsBestTimes).toEqual([]);
    });

    // it('deleteBestTimes should fail if update fails', async () => {
    //     jest.spyOn(gameModel.prototype, 'save').mockRejectedValue('');
    //     await expect(service.deleteBestTimes()).rejects.toBeTruthy();
    // });

    it('deleteBestTime should reset to default values bestTimes of specified game', async () => {
        await gameModel.deleteMany({});
        const game1 = getFakeGame();
        const game2 = getFakeGame2();
        game1.soloBestTimes = [
            { name: 'newBest', time: 1 },
            { name: 'secondBest', time: 3 },
            { name: 'Player 3', time: 180 },
        ];
        game2.soloBestTimes = [
            { name: 'newBest', time: 3 },
            { name: 'secondBest', time: 5 },
            { name: 'Player 3', time: 180 },
        ];
        game1.vsBestTimes = [
            { name: 'newBest', time: 1 },
            { name: 'Player 2', time: 120 },
            { name: 'Player 3', time: 180 },
        ];
        await gameModel.create(game1);
        await gameModel.create(game2);
        await service.deleteBestTime(game1.name);
        const gamesUpdated = await gameModel.find();
        expect(gamesUpdated[0].soloBestTimes).toEqual([]);
        expect(gamesUpdated[1].soloBestTimes).toEqual([
            { name: 'newBest', time: 3 },
            { name: 'secondBest', time: 5 },
            { name: 'Player 3', time: 180 },
        ]);
        expect(gamesUpdated[0].vsBestTimes).toEqual([]);
    });

    // it('deleteBestTime should fail if update fails', async () => {
    //     jest.spyOn(gameModel.prototype, 'save').mockRejectedValue('');
    //     await expect(service.deleteBestTimes()).rejects.toBeTruthy();
    // });

    it('updateBestTime should add new bestTime to specified game if its an actual new best and send a new message', async () => {
        jest.spyOn(chatGateway, 'newBestTimeScore').mockImplementation();
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await gameModel.create(game);
        const position = await service.updateBestTime(game.name, newFakeBestTime());
        const gameUpdated = await gameModel.findOne({ name: game.name });
        expect(gameUpdated.soloBestTimes).toEqual([
            { name: 'newBest', time: 1 },
            { name: 'Player 1', time: 60 },
            { name: 'Player 2', time: 120 },
        ]);
        expect(gameUpdated.vsBestTimes).toEqual(game.vsBestTimes);
        expect(chatGateway.newBestTimeScore).toHaveBeenCalledWith('newBest obtient la 1 place dans les meilleurs temps du jeu FakeGame en mode solo');
        expect(position).toEqual(0);
    });

    it('updateBestTime should add new bestTime to specified game if its an actual new best and send a new message', async () => {
        jest.spyOn(chatGateway, 'newBestTimeScore').mockImplementation();
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await gameModel.create(game);
        const newBestTime = newFakeBestTime();
        newBestTime.isSolo = false;
        const position = await service.updateBestTime(game.name, newBestTime);
        const gameUpdated = await gameModel.findOne({ name: game.name });
        expect(gameUpdated.vsBestTimes).toEqual([
            { name: 'newBest', time: 1 },
            { name: 'Player 1', time: 60 },
            { name: 'Player 2', time: 120 },
        ]);
        expect(gameUpdated.soloBestTimes).toEqual(game.soloBestTimes);
        expect(chatGateway.newBestTimeScore).toHaveBeenCalledWith(
            'newBest obtient la 1 place dans les meilleurs temps du jeu FakeGame en mode un contre un',
        );
        expect(position).toEqual(0);
    });

    it('updateBestTime should not add new time if its not a new best score for the game', async () => {
        jest.spyOn(chatGateway, 'newBestTimeScore').mockImplementation();
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await gameModel.create(game);
        const newBestTime = newFakeBestTime();
        newBestTime.isSolo = false;
        newBestTime.time = 50000;
        const position = await service.updateBestTime(game.name, newBestTime);
        const gameUpdated = await gameModel.findOne({ name: game.name });
        expect(gameUpdated.vsBestTimes).toEqual(game.vsBestTimes);
        expect(gameUpdated.soloBestTimes).toEqual(game.soloBestTimes);
        expect(chatGateway.newBestTimeScore).not.toHaveBeenCalled();
        expect(position).toEqual(NOT_TOP3);
    });

    // it('BestTime should return an array of type BestTime', () => {
    //     const game = getFakeGame();
    //     expect(game.soloBestTimes).toBeInstanceOf(Array);
    //     expect(game.soloBestTimes[0]).toBeInstanceOf(BestTime);
    // });
});

const getFakeGame = (): Game => ({
    name: 'FakeGame',
    nbDifference: 5,
    difficulty: 'facile',
    soloBestTimes: newBestTimes(),
    vsBestTimes: newBestTimes(),
});

const getFakeGame2 = (): Game => ({
    name: 'FakeGame',
    nbDifference: 8,
    difficulty: 'difficile',
    soloBestTimes: newBestTimes(),
    vsBestTimes: newBestTimes(),
});

const getFakeGameData = (): GameData => ({
    differenceMatrix: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ],
    name: 'FakeGame',
    nbDifference: 5,
    image1url: `${environment.serverUrl}/FakeGame/image1.bmp`,
    image2url: `${environment.serverUrl}/FakeGame/image2.bmp`,
    difficulty: 'facile',
    soloBestTimes: newBestTimes(),
    vsBestTimes: newBestTimes(),
});

const newBestTimes = (): BestTime[] => [
    { name: 'Player 1', time: 60 },
    { name: 'Player 2', time: 120 },
    { name: 'Player 3', time: 180 },
];

const newFakeBestTime = (): NewBestTime => ({ name: 'newBest', time: 1, gameName: 'FakeGame', isSolo: true });
