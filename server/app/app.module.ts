import { GameFinderGateway } from '@app/gateways/game-finder/game-finder.gateway';
import { GameController } from '@app/controllers/game/game.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameModeGateway } from '@app/gateways/game-mode/game-mode.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { gameHistorySchema } from '@app/model/database/game-history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameService } from '@app/services/game/game.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigController } from '@app/controllers/config/config.controller';
import { gameConstantsSchema } from '@app/model/database/game-constants';
import { GameConstantsService } from '@app/services/game-constant/game-constants.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env, add '_TESTING' to the end for testing database
            }),
        }),
        MongooseModule.forFeature([
            { name: Game.name, schema: gameSchema },
            { name: 'games-histories', schema: gameHistorySchema },
            { name: 'game-constants', schema: gameConstantsSchema },
        ]),
    ],
    controllers: [GameController, ConfigController],
    providers: [
        GameFinderGateway,
        ConfigService,
        Logger,
        GameHistoryService,
        GameService,
        GameConstantsService,
        GameModeGateway,
        ChatGateway,
        GameModeService,
        WaitingRoomGateway,
    ],
})
export class AppModule {}
