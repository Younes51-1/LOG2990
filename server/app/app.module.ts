import { GameController } from '@app/controllers/game/game.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ClassicModeGateway } from '@app/gateways/classic-mode/classic-mode.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { gameHistorySchema } from '@app/model/database/game-history';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameService } from '@app/services/game/game.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigController } from './controllers/config/config.controller';
import { gameConstantsSchema } from './model/database/game-constants';
import { GameConstantsService } from './services/game-constant/game-constants.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: Game.name, schema: gameSchema },
            { name: 'games-histories', schema: gameHistorySchema },
            { name: 'game-constants', schema: gameConstantsSchema },
        ]),
    ],
    controllers: [GameController, ConfigController],
    providers: [ConfigService, Logger, GameHistoryService, GameService, ClassicModeService, GameConstantsService, ClassicModeGateway, ChatGateway],
})
export class AppModule {}
