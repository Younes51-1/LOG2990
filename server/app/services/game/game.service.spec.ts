import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants';
import { environment } from '@app/environments/environment.prod';
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { GameData } from '@app/model/dto/game/game-data.dto';
import { BestTime } from '@app/model/schema/best-time.schema';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameService } from '@app/services/game/game.service';

describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
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
            providers: [GameService],
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

    it('getAllGames() return all games in database', async () => {
        await gameModel.deleteMany({});
        expect(await service.getAllGames()).toEqual([]);
        const game = getFakeGame();
        await gameModel.create(game);
        expect((await service.getAllGames()).length).toEqual(1);
    });

    it('addGame() should add the game to the DB', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGameData();
        await service.createNewGame({
            name: game.gameForm.name,
            nbDifference: game.gameForm.nbDifference,
            image1: '...',
            image2: '...',
            differenceMatrix: game.differenceMatrix,
        });
        expect(await gameModel.countDocuments()).toEqual(1);
    });

    it('addGame() shouldnt add game if database throw error', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        await gameModel.deleteMany({});
        const game = getFakeGameData();
        await expect(
            service.createNewGame({
                name: game.gameForm.name,
                nbDifference: game.gameForm.nbDifference,
                image1: '...',
                image2: '...',
                differenceMatrix: game.differenceMatrix,
            }),
        ).rejects.toBeTruthy();
    });

    it('addGame() should fail if fs.write of saveImage fails', async () => {
        jest.spyOn(service, 'saveImage').mockImplementation(async () => Promise.reject(''));
        await gameModel.deleteMany({});
        const game = getFakeGameData();
        await expect(
            service.createNewGame({
                name: game.gameForm.name,
                nbDifference: game.gameForm.nbDifference,
                image1: '...',
                image2: '...',
                differenceMatrix: game.differenceMatrix,
            }),
        ).rejects.toBeTruthy();
    });

    it('getGame() return game with the specified name', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.getGame(game.name)).toEqual(expect.objectContaining(getFakeGameData()));
    });

    it('getGame() return undefined if game with the specified subject code does not exist', async () => {
        expect(await service.getGame('FakeGame')).toEqual({});
    });

    it('calculateDifficulty should return the correct difficulty', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame2();
        await gameModel.create(game);
        const getGame = await service.getGame(game.name);
        expect(getGame.gameForm.difficulte).toEqual('Difficile');
    });

    it('deleteGame() should delete the game', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await gameModel.create(game);
        await service.deleteGame(game.name);
        expect(await gameModel.countDocuments()).toEqual(0);
    });

    it('deleteGame() should fail if the game does not exist', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await expect(service.deleteGame(game.name)).rejects.toBeTruthy();
    });

    it('deleteGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'deleteOne').mockRejectedValue('');
        const game = getFakeGame();
        await expect(service.deleteGame(game.name)).rejects.toBeTruthy();
    });

    it('BestTime should return an array of type BestTime', () => {
        const game = getFakeGame();
        expect(game.soloBestTimes).toBeInstanceOf(Array);
        expect(game.soloBestTimes[0]).toBeInstanceOf(BestTime);
    });
});

const getFakeGame = (): Game => ({
    name: 'FakeGame',
    nbDifference: 5,
    soloBestTimes: [new BestTime(), new BestTime(), new BestTime()],
    vsBestTimes: [new BestTime(), new BestTime(), new BestTime()],
});

const getFakeGame2 = (): Game => ({
    name: 'FakeGame',
    nbDifference: 8,
    soloBestTimes: [new BestTime(), new BestTime(), new BestTime()],
    vsBestTimes: [new BestTime(), new BestTime(), new BestTime()],
});

const getFakeGameData = (): GameData => ({
    differenceMatrix: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ],
    gameForm: {
        name: 'FakeGame',
        nbDifference: 5,
        image1url: `${environment.serverUrl}/FakeGame/image1.bmp`,
        image2url: `${environment.serverUrl}/FakeGame/image2.bmp`,
        difficulte: 'Facile',
        soloBestTimes: [new BestTime(), new BestTime(), new BestTime()],
        vsBestTimes: [new BestTime(), new BestTime(), new BestTime()],
    },
});
