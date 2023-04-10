/* eslint-disable max-lines */
import { environment } from '@app/environments/environment.prod';
import { GameModeGateway } from '@app/gateways/game-mode/game-mode.gateway';
import { DelayBeforeEmittingTime, GameModeEvents } from '@app/gateways/game-mode/game-mode.gateway.variables';
import { BestTime } from '@app/model/schema/best-times.schema';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('GameModeGateway', () => {
    let gateway: GameModeGateway;
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
                GameModeGateway,
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

        gateway = module.get<GameModeGateway>(GameModeGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('validateDifference should emit difference validated with true if difference is valid', async () => {
        const differencePos = new Vector2D();
        differencePos.x = 1;
        differencePos.y = 1;
        const validateDifferenceSpy = jest.spyOn(gameModeService, 'validateDifference').mockImplementation(() => {
            return true;
        });
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(GameModeEvents.DifferenceValidated);
                expect(validated).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.validateDifference(socket, { differencePos, roomId: getFakeGameRoom().roomId, username: getFakeGameRoom().userGame.username1 });
        expect(validateDifferenceSpy).toHaveBeenCalled();
    });

    it('validateDifference should emit difference validated with false if difference is not valid', async () => {
        const differencePos = new Vector2D();
        differencePos.x = 0;
        differencePos.y = 0;
        const validateDifferenceSpy = jest.spyOn(gameModeService, 'validateDifference').mockImplementation(() => {
            return false;
        });
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(GameModeEvents.DifferenceValidated);
                expect(validated).toEqual(false);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.validateDifference(socket, { differencePos, roomId: getFakeGameRoom().roomId, username: getFakeGameRoom().userGame.username1 });
        expect(validateDifferenceSpy).toHaveBeenCalled();
    });

    it('validateDifference should emit difference validated and end the game if no more differences', async () => {
        const differencePos = new Vector2D();
        differencePos.x = 1;
        differencePos.y = 1;
        const validateDifferenceSpy = jest.spyOn(gameModeService, 'validateDifference').mockImplementation(() => {
            return true;
        });
        const isGameFinishedSpy = jest.spyOn(gameModeService, 'isGameFinished').mockImplementation(() => {
            return true;
        });
        const endGameSpy = jest.spyOn(gateway, 'endGame').mockImplementation();
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(GameModeEvents.DifferenceValidated);
                expect(validated).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.validateDifference(socket, { differencePos, roomId: getFakeGameRoom().roomId, username: getFakeGameRoom().userGame.username1 });
        expect(validateDifferenceSpy).toHaveBeenCalled();
        expect(isGameFinishedSpy).toHaveBeenCalled();
        expect(endGameSpy).toHaveBeenCalled();
    });

    it('endGame should emit endGame event with the timer', () => {
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameModeEvents.GameFinished);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.endGame(socket, getFakeEndGame());
    });

    it('endGame should do nothing if the gameRoom does not exist', () => {
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return undefined;
        });
        gateway.endGame(socket, getFakeEndGame());
        expect(logger.log.notCalled).toBeTruthy();
    });

    it('Abandoned should emit Abandoned event with the username of the one quitting the game', () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        const abandonClassicModeSpy = jest.spyOn(gameModeService, 'abandonClassicMode').mockImplementation();
        server.to.returns({
            emit: (event: string, { gameRoom, username }) => {
                expect(event).toEqual(GameModeEvents.Abandoned);
                expect(gameRoom).toEqual(getFakeGameRoom());
                expect(username).toEqual(getFakeGameRoom().userGame.username1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.abandoned(socket, { roomId: getFakeGameRoom().roomId, username: getFakeGameRoom().userGame.username1 });
        expect(getGameRoomSpy).toHaveBeenCalled();
        expect(abandonClassicModeSpy).toHaveBeenCalled();
    });

    it('Abandoned should emit Abandoned event with the username of the one quitting the limited-mode game and if host', () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            const gameRoom = getFakeGameRoom();
            gameRoom.gameMode = 'limited-mode';
            return gameRoom;
        });
        const abandonLimitedTimeModeSpy = jest.spyOn(gameModeService, 'abandonLimitedTimeMode').mockImplementation();
        const gameRoomSent = getFakeGameRoom();
        gameRoomSent.gameMode = 'limited-mode';
        const gameRoomExpected = gameRoomSent;
        gameRoomExpected.roomId = 'socketId2';
        const roomsMap = new Map<string, Set<string>>();
        roomsMap.set(gameRoomSent.roomId, new Set<string>([socket.id, 'socketId2']));
        Object.defineProperty(server, 'sockets', { value: { adapter: { rooms: roomsMap } }, writable: true });
        socket.join(gameRoomSent.roomId);
        server.to.returns({
            emit: (event: string, { gameRoom, username }) => {
                expect(event).toEqual(GameModeEvents.Abandoned);
                expect(gameRoom).toEqual(gameRoomExpected);
                expect(username).toEqual(gameRoomSent.userGame.username1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.abandoned(socket, { roomId: gameRoomSent.roomId, username: gameRoomSent.userGame.username1 });
        expect(getGameRoomSpy).toHaveBeenCalled();
        expect(abandonLimitedTimeModeSpy).toHaveBeenCalled();
    });

    it('Abandoned should emit Abandoned event with the username of the one quitting the limited-mode game and if not host', () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            const gameRoom = getFakeGameRoom();
            gameRoom.gameMode = 'limited-mode';
            gameRoom.roomId = 'socketId2';
            return gameRoom;
        });
        const abandonLimitedTimeModeSpy = jest.spyOn(gameModeService, 'abandonLimitedTimeMode').mockImplementation();
        const gameRoomSent = getFakeGameRoom();
        gameRoomSent.gameMode = 'limited-mode';
        gameRoomSent.roomId = 'socketId2';
        const roomsMap = new Map<string, Set<string>>();
        roomsMap.set(gameRoomSent.roomId, new Set<string>([socket.id]));
        Object.defineProperty(server, 'sockets', { value: { adapter: { rooms: roomsMap } }, writable: true });
        socket.join(gameRoomSent.roomId);
        server.to.returns({
            emit: (event: string, { gameRoom, username }) => {
                expect(event).toEqual(GameModeEvents.Abandoned);
                expect(gameRoom).toEqual(gameRoomSent);
                expect(username).toEqual(gameRoomSent.userGame.username1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.abandoned(socket, { roomId: gameRoomSent.roomId, username: gameRoomSent.userGame.username1 });
        expect(getGameRoomSpy).toHaveBeenCalled();
        expect(abandonLimitedTimeModeSpy).toHaveBeenCalled();
    });

    it('Abandoned should do nothing if the game doesnt exists', () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return undefined;
        });
        const abandonClassicModeSpy = jest.spyOn(gameModeService, 'abandonClassicMode').mockImplementation();
        gateway.abandoned(socket, { roomId: getFakeGameRoom().roomId, username: getFakeGameRoom().userGame.username1 });
        expect(getGameRoomSpy).toHaveBeenCalled();
        expect(abandonClassicModeSpy).not.toHaveBeenCalled();
    });

    it('changeTime should call applyTimeToTimer', () => {
        jest.spyOn(gameModeService, 'applyTimeToTimer').mockImplementation();
        gateway.changeTime(socket, { roomId: getFakeGameRoom().roomId, time: 1 });
        expect(gameModeService.applyTimeToTimer).toHaveBeenCalledWith(getFakeGameRoom().roomId, 1);
    });

    it('nextGame should call nextGame', () => {
        jest.spyOn(gameModeService, 'nextGame').mockImplementation();
        gateway.nextGame(socket, getFakeGameRoom());
        expect(gameModeService.nextGame).toHaveBeenCalledWith(getFakeGameRoom());
    });

    it('afterInit should have created an interval to emit time', () => {
        const emitTimeSpy = jest.spyOn(gateway, 'emitTime').mockImplementation();
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DelayBeforeEmittingTime.DELAY_BEFORE_EMITTING_TIME);
        expect(emitTimeSpy).toHaveBeenCalled();
    });

    it('socket connection should be logged', () => {
        gateway.handleConnection(socket);
        expect(logger.log.called).toBeTruthy();
    });

    it('socket disconnection should be logged and call deleteRoom', () => {
        const deleteRoomSpy = jest.spyOn(gameModeService, 'deleteRoom').mockImplementation();
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        gateway.handleDisconnect(socket);
        expect(logger.log.called).toBeTruthy();
        expect(deleteRoomSpy).toHaveBeenCalled();
    });

    it('socket disconnection should just return if the game doesnt exists', () => {
        const deleteRoomSpy = jest.spyOn(gameModeService, 'deleteRoom').mockImplementation();
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return undefined;
        });
        gateway.handleDisconnect(socket);
        expect(deleteRoomSpy).not.toHaveBeenCalled();
    });

    it('emitTime should emit time after 1s to connected socket', () => {
        const emitTimeSpy = jest.spyOn(gateway, 'emitTime');
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        jest.spyOn(gameModeService, 'getRoomsValues').mockImplementation(() => {
            return [getFakeGameRoom()];
        });
        jest.useFakeTimers();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameModeEvents.Timer);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.emitTime();
        jest.advanceTimersByTime(DelayBeforeEmittingTime.DELAY_BEFORE_EMITTING_TIME);
        expect(emitTimeSpy).toHaveBeenCalled();
    });

    it('cancelDeletedGame should emit gameCanceled event', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameModeEvents.GameCanceled);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.cancelDeletedGame('FakeGame');
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

const getFakeEndGame = (): EndGame => ({
    username: getFakeGameRoom().userGame.username1,
    roomId: getFakeGameRoom().roomId,
    winner: true,
    gameFinished: true,
});
