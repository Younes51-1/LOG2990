import { environment } from '@app/environments/environment';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ChatEvents } from '@app/gateways/chat/chat.gateway.variables';
import { BestTime } from '@app/model/schema/best-times.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket, 'id', { value: getFakeGameRoom().roomId, writable: true });
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should send a message to the room', () => {
        const room = getFakeGameRoom();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ChatEvents.Message);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.sendMessage(socket, { message: 'fake message', username: room.userGame.username1, roomId: room.roomId });
    });

    it('newBestScore should send newBestScore to everyone', () => {
        server.to.returns({
            emit: (event: string, message: string) => {
                expect(event).toEqual(ChatEvents.Message);
                expect(message).toEqual(getFakeNewBestScoreMessage());
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.newBestTimeScore(getFakeNewBestScoreMessage());
    });
});

/* eslint-disable @typescript-eslint/no-magic-numbers */
const getFakeUserGame1 = (): UserGame => ({
    username1: 'FakeUser',
    nbDifferenceFound: 0,
    timer: 0,
    potentialPlayers: [],
    gameData: {
        differenceMatrix: [
            [-1, -1, -1],
            [-1, 1, -1],
            [-1, -1, -1],
        ],
        name: 'FakeGame',
        nbDifference: 2,
        image1url: `${environment.serverUrl}/FakeGame/image1.bmp`,
        image2url: `${environment.serverUrl}/FakeGame/image2.bmp`,
        difficulty: 'Facile',
        soloBestTimes: [new BestTime(), new BestTime(), new BestTime()],
        vsBestTimes: [new BestTime(), new BestTime(), new BestTime()],
    },
});
/* eslint-enable @typescript-eslint/no-magic-numbers */

const getFakeGameRoom = (): GameRoom => ({
    userGame: getFakeUserGame1(),
    roomId: 'socketId',
    started: true,
    gameMode: 'mode classique',
});

const getFakeNewBestScoreMessage = (): string => 'FakePlayer obtient la 2 place dans les meilleurs temps du jeu FakeGame en mode solo';
