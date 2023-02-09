import { DIFFICULTY_THRESHOLD, SERVER_URL } from '@app/constants';
import { Game, GameDocument } from '@app/model/database/game';
import { GameData } from '@app/model/dto/game/game-data.dto';
import { GameForm } from '@app/model/dto/game/game-form.dto';
import { NewGame } from '@app/model/dto/game/new-game.dto';
import { BestTime } from '@app/model/schema/best-times.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) public gameModel: Model<GameDocument>) {}

    async getAllGames(): Promise<GameForm[]> {
        const games = await this.gameModel.find({}).select('-differenceMatrix');
        if (games === undefined || games === null) {
            return [];
        }
        return games.map((game) => this.convertGameToGameForm(game));
    }

    async getGame(name: string): Promise<GameData> {
        const game = await this.gameModel.findOne({ name });
        if (game === undefined || game === null) {
            return new GameData();
        }
        return this.convertGameToGameData(game);
    }

    async createNewGame(newGame: NewGame): Promise<void> {
        try {
            await this.saveImages(newGame);
            const gameToSave = await this.convertNewGameToGame(newGame);
            await this.gameModel.create(gameToSave);
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async deleteGame(name: string): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({
                name,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find game');
            }
            this.deleteImages(name);
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }

    async saveImages(newGame: NewGame): Promise<void> {
        let bufferObjImage = Buffer.from(newGame.image1, 'base64');
        await this.saveImage(bufferObjImage, newGame.name, '1');
        bufferObjImage = Buffer.from(newGame.image2, 'base64');
        await this.saveImage(bufferObjImage, newGame.name, '2');
    }

    async saveImage(bufferObj: Buffer, name: string, index: string): Promise<void> {
        const dirName = `./assets/${name}`;
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
        fs.writeFile(`${dirName}/image${index}.bmp`, bufferObj, async (err) => {
            if (err) {
                return Promise.reject(`Failed to save image: ${err}`);
            }
        });
    }

    private deleteImages(name: string): void {
        const dirName = `./assets/${name}`;
        fs.rmSync(dirName, { recursive: true, force: true });
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

    private convertGameToGameForm(game: Game): GameForm {
        const gameForm = new GameForm();
        gameForm.name = game.name;
        gameForm.nbDifference = game.nbDifference;
        gameForm.image1url = `${SERVER_URL}/${game.name}/image1.bmp`;
        gameForm.image2url = `${SERVER_URL}/${game.name}/image2.bmp`;
        gameForm.difficulte = this.calculateDifficulty(game.nbDifference);
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

    private calculateDifficulty(nbDifference: number): string {
        if (nbDifference <= DIFFICULTY_THRESHOLD) {
            return 'facile';
        } else {
            return 'difficile';
        }
    }
}
