import { GameConstantsDocument } from '@app/model/database/game-constants';
import { GameConstants } from '@app/model/dto/game-history/game-constants.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameConstantsService {
    constructor(@InjectModel('game-constants') public gameConstantsModel: Model<GameConstantsDocument>) {
        this.initiateGameConstants();
    }

    async getGameConstants(): Promise<GameConstants> {
        return await this.gameConstantsModel.findOne({});
    }

    async initiateGameConstants(): Promise<void> {
        const constants = await this.gameConstantsModel.findOne({});
        if (!constants) {
            const gameConstants: GameConstants = {
                initialTime: 30,
                penaltyTime: 5,
                bonusTime: 5,
            };
            await this.gameConstantsModel.create(gameConstants);
        }
    }

    async updateGameConstants(gameConstants: GameConstants): Promise<void> {
        await this.gameConstantsModel.updateOne({}, gameConstants);
    }
}
