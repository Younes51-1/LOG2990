import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants';
import { GameHistory, gameHistorySchema, HistoryDocument } from '@app/model/database/game-history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let gameHistoryModel: Model<HistoryDocument>;
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
                MongooseModule.forFeature([{ name: 'games-histories', schema: gameHistorySchema }]),
            ],
            providers: [GameHistoryService],
        }).compile();

        service = module.get<GameHistoryService>(GameHistoryService);
        gameHistoryModel = module.get<Model<HistoryDocument>>(getModelToken('games-histories'));
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
        expect(gameHistoryModel).toBeDefined();
    });

    it('should return the game constants', async () => {
        await gameHistoryModel.deleteMany({});
        await gameHistoryModel.create(getFakeGameHistory());
        await gameHistoryModel.create(getFakeGameHistory2());
        const gameHistories = await service.getGamesHistories();
        expect(gameHistories.length).toEqual(2);
        expect(gameHistories[0].name).toEqual(getFakeGameHistory().name);
        expect(gameHistories[1].name).toEqual(getFakeGameHistory2().name);
    });

    it('saveGameHistory should save the game history in database', async () => {
        await gameHistoryModel.deleteMany({});
        await service.saveGameHistory(getFakeGameHistory());
        const gameHistories = await service.getGamesHistories();
        expect(gameHistories.length).toEqual(1);
        expect(gameHistories[0].name).toEqual(getFakeGameHistory().name);
    });

    it('should have rejected if cannot create new gameHistory', async () => {
        jest.spyOn(gameHistoryModel, 'create').mockImplementation(async () => Promise.reject(''));
        await gameHistoryModel.deleteMany({});
        await expect(service.saveGameHistory(getFakeGameHistory())).rejects.toBeTruthy();
    });

    it('deleteGamesHistories should delete all game histories in database when no id provided', async () => {
        await gameHistoryModel.deleteMany({});
        await gameHistoryModel.create(getFakeGameHistory());
        await gameHistoryModel.create(getFakeGameHistory2());
        await service.deleteGamesHistories();
        const gameHistories = await service.getGamesHistories();
        expect(gameHistories.length).toEqual(0);
    });

    it('deleteGamesHistories should delete the game history in database when id provided', async () => {
        await gameHistoryModel.deleteMany({});
        const gameHistory = await gameHistoryModel.create(getFakeGameHistory());
        await gameHistoryModel.create(getFakeGameHistory2());
        // eslint-disable-next-line no-underscore-dangle
        await service.deleteGamesHistories(gameHistory._id);
        const gameHistories = await service.getGamesHistories();
        expect(gameHistories.length).toEqual(1);
        expect(gameHistories[0].name).toEqual(getFakeGameHistory2().name);
    });

    // it('should have rejected if cannot delete one or many', async () => {
    //     jest.spyOn(gameHistoryModel, 'deleteMany').mockRejectedValue('');
    //     await gameHistoryModel.deleteMany({});
    //     await expect(service.deleteGamesHistories()).rejects.toBeTruthy();
    // });
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
