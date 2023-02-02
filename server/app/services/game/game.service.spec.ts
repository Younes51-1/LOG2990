import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants';
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameService } from './game.service';

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
        expect((await service.getAllGames()).length).toEqual(0);
        const game = getFakeGame();
        await gameModel.create(game);
        expect((await service.getAllGames()).length).toEqual(1);
    });

    it('getGame() return game with the specified name', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.getGame(game.name)).toEqual(expect.objectContaining(getFakeGameData()));
    });

    it('getGame() return undefined if game with the specified subject code does not exist', async () => {
        expect(await service.getGame('FakeGame')).toEqual({});
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

    it('addGame() should add the game to the DB', async () => {
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
});

const getFakeGame = (): Game => ({
    name: 'FakeGame',
    nbDifference: 5,
    differenceMatrix: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ],
    soloBestTimes: [
        {
            name: 'Easy',
            time: '3:00',
        },
        {
            name: 'Easy',
            time: '3:00',
        },
        {
            name: 'Easy',
            time: '3:00',
        },
    ],
    vsBestTimes: [
        {
            name: 'Easy',
            time: '3:00',
        },
        {
            name: 'Easy',
            time: '3:00',
        },
        {
            name: 'Easy',
            time: '3:00',
        },
    ],
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
        soloBestTimes: [
            {
                name: 'Easy',
                time: '3:00',
            },
            {
                name: 'Easy',
                time: '3:00',
            },
            {
                name: 'Easy',
                time: '3:00',
            },
        ],
        vsBestTimes: [
            {
                name: 'Easy',
                time: '3:00',
            },
            {
                name: 'Easy',
                time: '3:00',
            },
            {
                name: 'Easy',
                time: '3:00',
            },
        ],
    },
});

const getFakeNewGame = (): NewGame => ({
    name: 'FakeGame',
    nbDifference: 5,
    image1: '...',
    image2: '...',
    differenceMatrix: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ],
});
