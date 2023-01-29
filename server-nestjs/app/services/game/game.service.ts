import { Game, GameDocument } from '@app/model/database/game';
import { GameData } from '@app/model/dto/game/gameData.dto';
import { GameForm } from '@app/model/dto/game/gameForm.dto';
import { NewGame } from '@app/model/dto/game/newGame.dto';
import { BestTime } from '@app/model/schema/bestTimes.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) public gameModel: Model<GameDocument>, private readonly logger: Logger) {}

    async getAllGames(): Promise<GameForm[]> {
        const games = await this.gameModel.find({});
        return games.map((game) => this.convertGameToGameForm(game));
    }

    async getGame(name: string): Promise<GameData> {
        const game = await this.gameModel.findOne({ name: name });
        if (game === null) {
            return Promise.reject(`Game ${name} does not exist`);
        }
        return this.convertGameToGameData(game);
    }

    async createNewGame(newGame: NewGame): Promise<void> {
        if (!this.validateNewGame(newGame)) {
            return Promise.reject('Invalid newGame format');
        }
        try {
            await this.saveImages(newGame);
            const gameToSave = await this.convertNewGameToGame(newGame);
            await this.gameModel.create(gameToSave);
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    private validateNewGame(newGame: NewGame): boolean {
        return newGame.name !== undefined && newGame.nbDifference !== undefined && newGame.differenceMatrix !== undefined;
    }

    private async convertNewGameToGame(newGame: NewGame): Promise<Game> {
        const game = new Game();
        game.name = newGame.name;
        game.nbDifference = newGame.nbDifference;
        game.differenceMatrix = newGame.differenceMatrix;
        game.soloBestTimes = this.newBestTimes();
        game.vsBestTimes = this.newBestTimes();
        return game;
    }

    private async saveImages(newGame: NewGame): Promise<void> {
        let bufferObjImage = Buffer.from(newGame.image1, 'base64');
        await this.saveImage(bufferObjImage, newGame.name, '1');
        bufferObjImage = Buffer.from(newGame.image2, 'base64');
        await this.saveImage(bufferObjImage, newGame.name, '2');
    }

    private async saveImage(bufferObj: Buffer, name: string, index: string): Promise<void> {
        const fs = require('fs');
        const dirName = `./assets/${name}`;
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
        fs.writeFile(`${dirName}/image${index}.bmp`, bufferObj, function (err) {
            if (err) {
                return Promise.reject(`Failed to save image: ${err}`);
            }
        });
    }

    private convertGameToGameForm(game: Game): GameForm {
        const gameForm = new GameForm();
        gameForm.name = game.name;
        gameForm.nbDifference = game.nbDifference;
        gameForm.soloBestTimes = game.soloBestTimes;
        gameForm.vsBestTimes = game.vsBestTimes;
        return gameForm;
    }

    private convertGameToGameData(game: Game): GameData {
        const gameData = new GameData();
        gameData.gameForm = this.convertGameToGameForm(game);
        gameData.differenceMatrix = game.differenceMatrix;
        return gameData;
    }

    private newBestTimes(): BestTime[] {
        return [
            { name: 'Easy', time: '3:00' },
            { name: 'Medium', time: '2:00' },
            { name: 'Hard', time: '1:00' },
        ];
    }
}
