import { GameRoom } from '@app/interfaces/game';

export interface VideoReplay {
    images: { original: string; modified: string };
    scoreboardParams: {
        gameRoom: GameRoom;
        gameName: string;
        opponentUsername: string;
        username: string;
    };
    actions: InstructionReplay[];
    rien: boolean;
}

export interface InstructionReplay {
    type: string;
    time: number;
}
