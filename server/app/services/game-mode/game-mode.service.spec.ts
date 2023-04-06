import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameModeGateway } from '@app/gateways/game-mode/game-mode.gateway';
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('GameModeService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let gameModeGateway: SinonStubbedInstance<GameModeGateway>;
    let chatGateway: SinonStubbedInstance<ChatGateway>;

    beforeEach(async () => {
        gameModeGateway = createStubInstance(GameModeGateway);
        chatGateway = createStubInstance(ChatGateway);
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
});
