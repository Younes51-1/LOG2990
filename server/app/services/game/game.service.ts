import { DIFFICULTY_THRESHOLD } from '@app/constants';
import { environment } from '@app/environments/environment.prod';
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
        const games = await this.gameModel.find({});
        return games.map((game) => this.convertGameToGameForm(game));
    }

    async getGame(name: string): Promise<GameData> {
        const game = await this.gameModel.findOne({ name });
        if (game === undefined || game === null) {
            return new GameData();
        }
        return await this.convertGameToGameData(game);
    }

    async createNewGame(newGame: NewGame): Promise<void> {
        try {
            await this.saveImages(newGame);
            await this.saveMatrix(newGame);
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

    async saveImage(bufferObj: Buffer, name: string, index: string): Promise<void> {
        const dirName = `./assets/${name}`;
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
        fs.writeFile(`${dirName}/image${index}.bmp`, bufferObj, async (err) => {
            if (err) {
                return Promise.reject(`Failed to save image: ${err}`);
            }
        });
    }

    private async convertNewGameToGame(newGame: NewGame): Promise<Game> {
        const game = new Game();
        game.name = newGame.name;
        game.nbDifference = newGame.nbDifference;
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

    private deleteImages(name: string): void {
        const dirName = `./assets/${name}`;
        fs.rmSync(dirName, { recursive: true, force: true });
    }

    private async saveMatrix(newGame: NewGame): Promise<void> {
        const dirName = `./assets/${newGame.name}`;
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
        const matrixtoString = newGame.differenceMatrix.map((row) => row.join(',')).join(';');
        fs.writeFile(`${dirName}/differenceMatrix.txt`, matrixtoString, async (err) => {
            if (err) {
                return Promise.reject(`Failed to save differenceMatix: ${err}`);
            }
        });
    }

    private async getMatrix(name: string): Promise<number[][]> {
        const dirName = `./assets/${name}`;
        if (!fs.existsSync(dirName)) return Promise.reject('Could not find game');
        try {
            const data = fs.readFileSync(`${dirName}/differenceMatrix.txt`, 'utf8');
            return this.convertMatrixStringToMatrix(data);
        } catch (err) {
            return Promise.reject(`Failed to get differenceMatix: ${err}`);
        }
    }

    private convertMatrixStringToMatrix(matrixString: string): number[][] {
        const matrix = matrixString.split(';').map((row) => row.split(','));
        return matrix.map((row) => row.map((cell) => parseInt(cell, 10)));
    }

    private convertGameToGameForm(game: Game): GameForm {
        const gameForm = new GameForm();
        gameForm.name = game.name;
        gameForm.nbDifference = game.nbDifference;
        gameForm.image1url = `${environment.serverUrl}/${game.name}/image1.bmp`;
        gameForm.image2url = `${environment.serverUrl}/${game.name}/image2.bmp`;
        gameForm.difficulte = this.calculateDifficulty(game.nbDifference);
        gameForm.soloBestTimes = game.soloBestTimes;
        gameForm.vsBestTimes = game.vsBestTimes;
        return gameForm;
    }

    private async convertGameToGameData(game: Game): Promise<GameData> {
        const gameData = new GameData();
        gameData.gameForm = this.convertGameToGameForm(game);
        gameData.differenceMatrix = await this.getMatrix(game.name);
        return gameData;
    }

    private newBestTimes(): BestTime[] {
        return [
            { name: 'Player 1', time: '1:00' },
            { name: 'Player 2', time: '2:00' },
            { name: 'Player 3', time: '3:00' },
        ];
    }

    private calculateDifficulty(nbDifference: number): string {
        return nbDifference <= DIFFICULTY_THRESHOLD ? 'Facile' : 'Difficile';
    }
}
