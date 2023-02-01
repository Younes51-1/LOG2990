export interface GameForm {
    name: string;
    nbDifference: number;
    image1url: string;
    image2url: string;
    soloBestTimes: BestTime[];
    vsBestTimes: BestTime[];
}

export interface BestTime {
    name: string;
    time: number;
}
