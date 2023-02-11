import { GameData } from './game-data';

export interface UserGame {
    username: string;
    gameData: GameData;
    nbDifferenceFound: number;
    timer: number;
}
