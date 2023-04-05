import { GameRoom } from '@app/interfaces/game';
import { Message } from './chat';
import { Vec2 } from './vec2';

export interface VideoReplay {
    images: { original: string; modified: string };
    scoreboardParams: {
        gameRoom: GameRoom;
        gameName: string;
        opponentUsername: string;
        username: string;
    };
    actions: InstructionReplay[];
    sources: string[];
    cheatLayers: HTMLCanvasElement[];
}

export enum Instruction {
    DiffFound = 'diffFound',
    Error = 'error',
    ChatMessage = 'chatMessage',
    CheatModeStart = 'cheatModeStart',
    CheatModeEnd = 'cheatModeEnd',
    Hint = 'hint',
    Score = 'score',
}

export interface InstructionReplay {
    type: Instruction;
    timeStart: number;
    cheatLayer?: HTMLCanvasElement;
    difference?: number[][];
    message?: Message;
    mousePosition?: Vec2;
    leftCanvas?: boolean;
    nbDifferences?: number;
    username?: string;
}
