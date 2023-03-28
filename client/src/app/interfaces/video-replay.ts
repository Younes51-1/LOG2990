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
}

export enum Instruction {
    DiffFound = 'diffFound',
    Error = 'error',
    ChatMessage = 'chatMessage',
    CheatMode = 'cheatMode',
}

export interface InstructionReplay {
    type: Instruction;
    timeStart: number;
    timeEnd: number;
    difference: number[][];
    message: Message;
    mousePosition: Vec2;
}
