import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants';
import { gameHistorySchema, HistoryDocument } from '@app/model/database/game-history';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameHistoryService } from './game-history.service';

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
});
