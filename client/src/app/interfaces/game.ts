export interface GameData {
    gameForm: GameForm;
    differenceMatrix: number[][];
}

export interface UserGame {
    username1: string;
    username2?: string;
    gameData: GameData;
    nbDifferenceFound: number;
    nbDifferenceFound2?: number;
    timer: number;
    potentialPlayers?: string[];
}

export interface GameForm {
    name: string;
    nbDifference: number;
    image1url: string;
    image2url: string;
    difficulty: string;
    soloBestTimes: BestTime[];
    vsBestTimes: BestTime[];
    isSelected?: boolean;
}

export interface BestTime {
    name: string;
    time: number;
}

export interface GameRoom {
    userGame: UserGame;
    roomId: string;
    started: boolean;
    gameMode: string;
}

export interface NewGame {
    name: string;
    image1: string;
    image2: string;
    difficulty: string;
    nbDifference: number;
    differenceMatrix: number[][];
}

export class NewBestTime {
    gameName: string;
    isSolo: boolean;
    name: string;
    time: number;
}

export interface GameHistory {
    _id?: string;
    name: string;
    startTime: number;
    timer: number;
    username1: string;
    username2?: string;
    gameMode: string;
    abandonned?: string;
    winner: string;
}

export interface EndGame {
    winner: boolean;
    roomId: string;
    username: string;
    gameFinished: boolean;
}

export interface GameContext {
    gameName: string;
    gameMode: string;
}
