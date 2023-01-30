export interface GameForm {
    name: string;
    nbDifference: number;
    soloBestTimes: BestTime[];
    vsBestTimes: BestTime[];
}

export interface BestTime {
    name: string;
    time: number;
}
