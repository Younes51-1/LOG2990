import { environment } from '@app/environments/environment';
import { GameFinderGateway } from '@app/gateways/game-finder/game-finder.gateway';
import { BestTime } from '@app/model/schema/best-times.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameFinderEvents } from './game-finder.gateway.variables';

describe('GameFinderGateway', () => {
    let gateway: GameFinderGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameModeService: SinonStubbedInstance<GameModeService>;
    let gameHistoryService: SinonStubbedInstance<GameHistoryService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        gameModeService = createStubInstance(GameModeService);
        gameHistoryService = createStubInstance(GameHistoryService);
        Object.defineProperty(socket, 'id', { value: getFakeGameRoom().roomId, writable: true });
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameFinderGateway,
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

        gateway = module.get<GameFinderGateway>(GameFinderGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('checkGame should emit gameName and event GameFound if the game exists', async () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(getFakeGameRoom());
        const loggerSpy = jest.spyOn(logger, 'log');
        const dataSent = { gameName: 'fakeGame', gameMode: 'mode classique' };
        server.to.returns({
            emit: (event: string, { gameName, gameMode }) => {
                expect(event).toEqual(GameFinderEvents.GameFound);
                expect(gameName).toEqual(dataSent.gameName);
                expect(gameMode).toEqual(dataSent.gameMode);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.checkGame(socket, dataSent);
        expect(getGameRoomSpy).toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(`Game finder gateway: Game ${dataSent.gameName} found`);
    });

    it('checkGame should emit gameName and event GameFound if the game exists', async () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => getFakeGameRoom());
        const loggerSpy = jest.spyOn(logger, 'log');
        const dataSent = { gameName: 'fakeGame', gameMode: 'time-limited' };
        server.to.returns({
            emit: (event: string, { gameName, gameMode }) => {
                expect(event).toEqual(GameFinderEvents.GameFound);
                expect(gameName).toEqual(dataSent.gameName);
                expect(gameMode).toEqual(dataSent.gameMode);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.checkGame(socket, dataSent);
        expect(getGameRoomSpy).toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith('Game finder gateway: Limited time game found');
    });

    it('checkGame should not emit gameName and event GameFound if the game exists but started', async () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            const gameRoom = getFakeGameRoom();
            gameRoom.started = true;
            return gameRoom;
        });
        const loggerSpy = jest.spyOn(logger, 'log');
        const dataSent = { gameName: 'fakeGame', gameMode: 'mode classique' };
        gateway.checkGame(socket, dataSent);
        expect(getGameRoomSpy).toHaveBeenCalled();
        expect(loggerSpy).not.toHaveBeenCalledWith(`Game finder gateway: Game ${dataSent.gameName} found`);
    });

    it('canJoinGame should emit event CanJoinGame if the game exists and is joinable', async () => {
        const canJoinGameSpy = jest.spyOn(gameModeService, 'canJoinGame').mockImplementation(() => getFakeGameRoom());
        const dataSent = { gameName: 'fakeGame', username: 'fakeUser', gameMode: 'mode classique' };
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameFinderEvents.CanJoinGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.canJoinGame(socket, dataSent);
        expect(canJoinGameSpy).toHaveBeenCalled();
    });

    it('canJoinGame should emit event CannotJoinGame if the game exists and is not joinable', async () => {
        const canJoinGameSpy = jest.spyOn(gameModeService, 'canJoinGame').mockImplementation(() => undefined);
        const dataSent = { gameName: 'fakeGame', username: 'fakeUser', gameMode: 'mode classique' };
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameFinderEvents.CannotJoinGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.canJoinGame(socket, dataSent);
        expect(canJoinGameSpy).toHaveBeenCalled();
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
    started: false,
    gameMode: 'mode classique',
});
