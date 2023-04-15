import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants';
import { GameConstants, GameConstantsDocument, gameConstantsSchema } from '@app/model/database/game-constants';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameConstantsService } from './game-constants.service';

describe('GameConstantsService', () => {
    let service: GameConstantsService;
    let gameConstantsModel: Model<GameConstantsDocument>;
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
                MongooseModule.forFeature([{ name: 'game-constants', schema: gameConstantsSchema }]),
            ],
            providers: [GameConstantsService],
        }).compile();

        service = module.get<GameConstantsService>(GameConstantsService);
        gameConstantsModel = module.get<Model<GameConstantsDocument>>(getModelToken('game-constants'));
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
        expect(gameConstantsModel).toBeDefined();
    });

    it('should return the game constants', async () => {
        await gameConstantsModel.deleteMany({});
        await gameConstantsModel.create(getInitConstants());
        const gameConstants = await service.getGameConstants();
        expect(gameConstants).toBeDefined();
        expect(gameConstants.initialTime).toEqual(getInitConstants().initialTime);
        expect(gameConstants.penaltyTime).toEqual(getInitConstants().penaltyTime);
        expect(gameConstants.bonusTime).toEqual(getInitConstants().bonusTime);
    });

    it('initiateGameConstants should create constants in database if not already created', async () => {
        await gameConstantsModel.deleteMany({});
        await service.initiateGameConstants();
        const gameConst = await service.getGameConstants();
        expect(gameConst).toBeDefined();
        expect(gameConst.initialTime).toEqual(getInitConstants().initialTime);
        expect(gameConst.penaltyTime).toEqual(getInitConstants().penaltyTime);
        expect(gameConst.bonusTime).toEqual(getInitConstants().bonusTime);
    });

    // it('initiateGameConstants should not create new constants in database if already present', async () => {
    //     await gameConstantsModel.deleteMany({});
    //     const gameConstants = await gameConstantsModel.create(getInitConstants());
    //     gameConstants.initialTime = 10;
    //     await gameConstantsModel.create(gameConstants);
    //     await service.initiateGameConstants();
    //     const afterInitgameConst = await gameConstantsModel.findOne({});
    //     expect(afterInitgameConst.initialTime).toEqual(gameConstants.initialTime);
    // });

    it('should update the game constants', async () => {
        await gameConstantsModel.deleteMany({});
        await gameConstantsModel.create(getInitConstants());
        const gameConstants = await service.getGameConstants();
        expect(gameConstants).toBeDefined();
        const newGameConstants = {
            initialTime: 10,
            penaltyTime: 10,
            bonusTime: 10,
        };
        await service.updateGameConstants(newGameConstants);
        const updatedGameConstants = await service.getGameConstants();
        expect(updatedGameConstants).toBeDefined();
        expect(updatedGameConstants.initialTime).toEqual(newGameConstants.initialTime);
        expect(updatedGameConstants.penaltyTime).toEqual(newGameConstants.penaltyTime);
        expect(updatedGameConstants.bonusTime).toEqual(newGameConstants.bonusTime);
    });
});

const getInitConstants = (): GameConstants => ({
    initialTime: 30,
    penaltyTime: 5,
    bonusTime: 5,
});
