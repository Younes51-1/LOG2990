export interface GameData {
    gameForm: GameForm;
    differenceMatrix: number[][];
}

export interface UserGame {
    username: string;
    username2?: string;
    gameData: GameData;
    nbDifferenceFound: number;
    timer: number;
    potentielPlayers?: string[];
}

export interface GameForm {
    name: string;
    nbDifference: number;
    image1url: string;
    image2url: string;
    difficulte: string;
    soloBestTimes: BestTime[];
    vsBestTimes: BestTime[];
}

export interface BestTime {
    name: string;
    time: number;
}

export interface GameRoom {
    userGame: UserGame;
    roomId: string;
    started: boolean;
}

export interface NewGame {
    name: string;
    image1: string;
    image2: string;
    difficulty: string;
    nbDifference: number;
    differenceMatrix: number[][];
}
