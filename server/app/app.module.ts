import { GameController } from '@app/controllers/game/game.controller';
import { GameService } from '@app/services/game/game.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassicModeGateway } from './gateways/classicMode/classic-mode.gateway';
import { Game, gameSchema } from './model/database/game';
import { ClassicModeService } from './services/classicMode/classic-mode.service';

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
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [GameService, ClassicModeGateway, ClassicModeService, Logger],
})
export class AppModule {}
