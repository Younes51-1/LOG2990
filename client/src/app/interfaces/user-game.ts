import { GameData } from './game-data';
import { Timer } from './timer';

export interface UserGame {
    username: string;
    gameData: GameData;
    nbDifferenceToFind: number;
    timer: Timer;
}
