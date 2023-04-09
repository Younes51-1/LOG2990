import { HistoryDocument } from '@app/model/database/game-history';
import { GameHistory } from '@app/model/dto/game-history/game-history.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameHistoryService {
    constructor(@InjectModel('games-histories') public historyModel: Model<HistoryDocument>) {}

    async getGamesHistories(): Promise<GameHistory[]> {
        return await this.historyModel.find({});
    }

    async saveGameHistory(gameHistory: GameHistory): Promise<void> {
        try {
            await this.historyModel.create(gameHistory);
        } catch (error) {
            return Promise.reject(`Failed to save game history: ${error}`);
        }
    }

    async deleteGamesHistories(): Promise<void> {
        try {
            await this.historyModel.deleteMany({});
        } catch (error) {
            return Promise.reject(`Failed to delete game histories: ${error}`);
        }
    }
}
