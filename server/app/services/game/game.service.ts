import { NOT_TOP3 } from '@app/constants';
import { environment } from '@app/environments/environment';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameModeGateway } from '@app/gateways/game-mode/game-mode.gateway';
import { Game, GameDocument } from '@app/model/database/game';
import { GameData } from '@app/model/dto/game/game-data.dto';
import { NewBestTime } from '@app/model/dto/game/new-best-times.dto';
import { NewGame } from '@app/model/dto/game/new-game.dto';
import { BestTime } from '@app/model/schema/best-times.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        private readonly gameModeGateway: GameModeGateway,
        private readonly chatGateway: ChatGateway,
    ) {}

    async getAllGames(): Promise<GameData[]> {
        const games = await this.gameModel.find({}).lean();
        const gameDataPromises = games.map(async (game) => this.convertGameToGameData(game));
        const gameData = await Promise.all(gameDataPromises);
        return gameData;
    }

    async getGame(name: string): Promise<GameData> {
        const game = await this.gameModel.findOne({ name });
        if (!game) return Promise.reject('Failed to get game');
        return await this.convertGameToGameData(game);
    }

    async getBestTime(name: string): Promise<{ soloBestTimes: BestTime[]; vsBestTimes: BestTime[] }> {
        const game = await this.gameModel.findOne({ name });
        if (!game) return undefined;
        return await { soloBestTimes: game.soloBestTimes, vsBestTimes: game.vsBestTimes };
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
            this.gameModeGateway.cancelDeletedGame(name);
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }

    async deleteAllGames(): Promise<void> {
        try {
            const games = await this.gameModel.find({});
            games.forEach(async (game) => {
                await this.gameModel.deleteOne({
                    name: game.name,
                });
                this.deleteImages(game.name);
                this.gameModeGateway.cancelDeletedGame(game.name);
            });
        } catch (error) {
            return Promise.reject(`Failed to delete all games: ${error}`);
        }
    }

    async deleteBestTimes(): Promise<void> {
        try {
            const games = await this.gameModel.find({});
            games.forEach(async (game) => {
                game.soloBestTimes = [];
                game.vsBestTimes = [];
                await game.save();
            });
        } catch (error) {
            return Promise.reject(`Failed to delete best times: ${error}`);
        }
    }

    async deleteBestTime(name: string): Promise<void> {
        try {
            const game = await this.gameModel.findOne({ name });
            game.soloBestTimes = [];
            game.vsBestTimes = [];
            await game.save();
        } catch (error) {
            return Promise.reject(`Failed to delete best time: ${error}`);
        }
    }

    async saveImage(bufferObj: Buffer, name: string, index: string): Promise<void> {
        const dirName = `./assets/${name}`;
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
        fs.writeFile(`${dirName}/image${index}.bmp`, bufferObj, () => {
            return; // folder already exists
        });
    }

    async getMatrix(name: string): Promise<number[][]> {
        const dirName = `./assets/${name}`;
        if (!fs.existsSync(dirName)) return Promise.reject('Could not find game');
        const data = fs.readFileSync(`${dirName}/differenceMatrix.txt`, 'utf8');
        return this.convertMatrixStringToMatrix(data);
    }

    async saveMatrix(newGame: NewGame): Promise<void> {
        const dirName = `./assets/${newGame.name}`;
        if (!fs.existsSync(dirName)) await fs.mkdirSync(dirName);
        const matrixToString = newGame.differenceMatrix.map((row) => row.join(',')).join(';');
        fs.writeFile(`${dirName}/differenceMatrix.txt`, matrixToString, () => {
            return; // folder already exists
        });
    }

    async updateBestTime(name: string, newBestTime: NewBestTime): Promise<number> {
        try {
            const game = await this.gameModel.findOne({ name });
            if (!game) return Promise.reject('Could not find game');
            let position;
            if (newBestTime.isSolo) {
                const { newBestTimes, position: newPosition } = this.insertNewBestTime(game.soloBestTimes, newBestTime);
                game.soloBestTimes = newBestTimes;
                position = newPosition;
            } else {
                const { newBestTimes, position: newPosition } = this.insertNewBestTime(game.vsBestTimes, newBestTime);
                game.vsBestTimes = newBestTimes;
                position = newPosition;
            }
            await game.save();
            if (position !== NOT_TOP3) {
                if (newBestTime.isSolo) {
                    this.chatGateway.newBestTimeScore(
                        `${newBestTime.name} obtient la ${position + 1} place dans les meilleurs temps du jeu ${newBestTime.gameName} en mode solo`,
                    );
                } else {
                    this.chatGateway.newBestTimeScore(
                        `${newBestTime.name} obtient la ${position + 1} place dans les meilleurs temps du jeu ${
                            newBestTime.gameName
                        } en mode un contre un`,
                    );
                }
            }
            return position;
        } catch (error) {
            return Promise.reject(`Failed to update best time: ${error}`);
        }
    }

    private insertNewBestTime(bestTimes: BestTime[], newBestTime: NewBestTime): { newBestTimes: BestTime[]; position: number } {
        const newBestTimes = bestTimes;
        const newBestTimeToInsert = new BestTime();
        newBestTimeToInsert.name = newBestTime.name;
        newBestTimeToInsert.time = newBestTime.time;
        newBestTimes.push(newBestTimeToInsert);
        newBestTimes.sort((a, b) => a.time - b.time);
        newBestTimes.pop();
        return { newBestTimes, position: newBestTimes.findIndex((bestTime) => bestTime.name === newBestTime.name) };
    }

    private async convertNewGameToGame(newGame: NewGame): Promise<Game> {
        const game = new Game();
        game.name = newGame.name;
        game.nbDifference = newGame.nbDifference;
        game.soloBestTimes = this.newBestTimes();
        game.vsBestTimes = this.newBestTimes();
        game.difficulty = newGame.difficulty;
        return game;
    }

    private newBestTimes(): BestTime[] {
        return [
            { name: 'Joueur 1', time: 60 },
            { name: 'Joueur 2', time: 120 },
            { name: 'Joueur 3', time: 180 },
        ];
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

    private convertMatrixStringToMatrix(matrixString: string): number[][] {
        const matrix = matrixString.split(';').map((row) => row.split(','));
        return matrix.map((row) => row.map((cell) => parseInt(cell, 10)));
    }

    private async convertGameToGameData(game: Game): Promise<GameData> {
        const { name, nbDifference, difficulty, soloBestTimes, vsBestTimes } = game;
        const gameData = new GameData();
        gameData.name = name;
        gameData.nbDifference = nbDifference;
        gameData.image1url = `${environment.serverUrl}/${name}/image1.bmp`;
        gameData.image2url = `${environment.serverUrl}/${name}/image2.bmp`;
        gameData.difficulty = difficulty;
        gameData.soloBestTimes = soloBestTimes;
        gameData.vsBestTimes = vsBestTimes;
        gameData.differenceMatrix = await this.getMatrix(name);
        return gameData;
    }
}
