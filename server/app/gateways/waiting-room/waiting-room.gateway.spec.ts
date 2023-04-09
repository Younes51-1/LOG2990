/* eslint-disable max-lines */
import { environment } from '@app/environments/environment.prod';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { BestTime } from '@app/model/schema/best-times.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';

describe('WaitingRoomGateway', () => {
    let gateway: WaitingRoomGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameModeService: SinonStubbedInstance<GameModeService>;
    let gameHistoryService: SinonStubbedInstance<GameHistoryService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        gameModeService = createStubInstance(GameModeService);
        gameHistoryService = createStubInstance(GameHistoryService);
        socket = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket, 'id', { value: getFakeGameRoom().roomId, writable: true });
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaitingRoomGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: GameModeService,
                    useValue: gameModeService,
                },
                {
                    provide: GameHistoryService,
                    useValue: gameHistoryService,
                },
            ],
        }).compile();

        gateway = module.get<WaitingRoomGateway>(WaitingRoomGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
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
    gameMode: 'classic-mode',
});
