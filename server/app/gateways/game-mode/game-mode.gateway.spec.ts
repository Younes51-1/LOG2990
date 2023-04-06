/* eslint-disable max-lines */
import { environment } from '@app/environments/environment.prod';
import { GameModeGateway } from '@app/gateways/game-mode/game-mode.gateway';
import { GameModeEvents, DelayBeforeEmittingTime } from '@app/gateways/game-mode/game-mode.gateway.variables';
import { BestTime } from '@app/model/schema/best-times.schema';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
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

    it('startGame should emit Started', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameModeEvents.Started);
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        gateway.startGame(socket, getFakeGameRoom().roomId);
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
        server.to.returns({
            emit: (event: string, player: string) => {
                expect(event).toEqual(GameModeEvents.Abandoned);
                expect(player).toEqual(getFakeGameRoom().userGame.username1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.abandoned(socket, { roomId: getFakeGameRoom().roomId, username: getFakeGameRoom().userGame.username1 });
    });

    it('checkGame should emit gameFound with the game name if one room was found', () => {
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(GameModeEvents.GameFound);
                expect(gameName).toEqual({ gameName: getFakeGameRoom().userGame.gameData.gameForm.name, gameMode: getFakeGameRoom().gameMode });
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.checkGame(socket, {
            gameName: getFakeGameRoom().userGame.gameData.gameForm.name,
            gameMode: getFakeGameRoom().gameMode,
        });
        expect(getGameRoomSpy).toHaveBeenCalled();
    });

    it('createGame should connect socket to new room and emit the room id with code started', () => {
        const initNewRoomSpy = jest.spyOn(gameModeService, 'initNewRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameModeEvents.GameCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.createGame(socket, getFakeGameRoom());
        expect(initNewRoomSpy).toHaveBeenCalled();
    });

    it('canJoinGame should emit true if the user can join and false otherwise', () => {
        const canJoinGameSpy = jest.spyOn(gameModeService, 'canJoinGame').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameModeEvents.CanJoinGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.canJoinGame(socket, {
            gameName: getFakeGameRoom().userGame.gameData.gameForm.name,
            username: getFakeGameRoom().userGame.username2,
            gameMode: getFakeGameRoom().gameMode,
        });
        expect(canJoinGameSpy).toHaveBeenCalled();
    });

    it('canJoinGame should emit false when the game cannot be joined', () => {
        const canJoinGameSpy = jest.spyOn(gameModeService, 'canJoinGame').mockImplementation(() => {
            return undefined;
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameModeEvents.CannotJoinGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.canJoinGame(socket, {
            gameName: getFakeGameRoom().userGame.gameData.gameForm.name,
            username: getFakeGameRoom().userGame.username2,
            gameMode: getFakeGameRoom().gameMode,
        });
        expect(canJoinGameSpy).toHaveBeenCalled();
    });

    it('joinGame should emit gameInfo with the game info if the user did join', () => {
        const joinGameSpy = jest.spyOn(gameModeService, 'joinGame').mockImplementation(() => {
            return true;
        });
        const getGameRoomSpy = jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(GameModeEvents.GameInfo);
                expect(gameInfo).toEqual(getFakeGameRoom());
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinGame(socket, {
            gameName: getFakeGameRoom().userGame.gameData.gameForm.name,
            username: getFakeGameRoom().userGame.username2,
            gameMode: getFakeGameRoom().gameMode,
        });
        expect(joinGameSpy).toHaveBeenCalled();
        expect(getGameRoomSpy).toHaveBeenCalled();
    });

    it('joinGame should emit gameInfo with the game info if the user did join', () => {
        const joinGameSpy = jest.spyOn(gameModeService, 'joinGame').mockImplementation(() => {
            return false;
        });
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(GameModeEvents.GameInfo);
                expect(gameInfo).toEqual(undefined);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinGame(socket, {
            gameName: getFakeGameRoom().userGame.gameData.gameForm.name,
            username: getFakeGameRoom().userGame.username2,
            gameMode: getFakeGameRoom().gameMode,
        });
        expect(joinGameSpy).toHaveBeenCalled();
    });

    it('abortGameCreation should emit gameCreationAborted', () => {
        const abortGameCreationSpy = jest.spyOn(gameModeService, 'deleteRoom').mockImplementation();
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(GameModeEvents.GameDeleted);
                expect(gameName).toEqual(getFakeGameRoom().userGame.gameData.gameForm.name);
            },
        } as BroadcastOperator<unknown, unknown>);
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(GameModeEvents.GameCanceled);
                expect(gameName).toEqual(getFakeGameRoom().userGame.gameData.gameForm.name);
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        gateway.abortGameCreation(socket, 'fakeRoomId');
        expect(abortGameCreationSpy).toHaveBeenCalled();
    });

    it("abortGameCreation shouldn't emit gameCreationAborted if gameRoom doesn't exist", () => {
        const abortGameCreationSpy = jest.spyOn(gameModeService, 'deleteRoom').mockImplementation();
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(GameModeEvents.GameDeleted);
                expect(gameName).toEqual(getFakeGameRoom().userGame.gameData.gameForm.name);
            },
        } as BroadcastOperator<unknown, unknown>);
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(GameModeEvents.GameCanceled);
                expect(gameName).toEqual(getFakeGameRoom().userGame.gameData.gameForm.name);
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return undefined;
        });
        gateway.abortGameCreation(socket, 'fakeRoomId');
        expect(abortGameCreationSpy).not.toHaveBeenCalled();
    });

    it('leaveGame should emit gameInfo with the game info if the user did leave', () => {
        const room = getFakeGameRoom();
        room.userGame.potentialPlayers = ['fakeUsername2'];
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(GameModeEvents.GameInfo);
                expect(gameInfo).toEqual(getFakeGameRoom());
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return room;
        });
        gateway.leaveGame(socket, { roomId: getFakeGameRoom().roomId, username: 'fakeUsername2' });
        expect(gameModeService.getGameRoom(getFakeGameRoom().roomId).userGame.potentialPlayers).toEqual([]);
    });

    it("leaveGame shouldn't emit gameInfo with the game info if gameRoom is undefined", () => {
        const room = getFakeGameRoom();
        room.userGame.potentialPlayers = ['fakeUsername2'];
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(GameModeEvents.GameInfo);
                expect(gameInfo).toEqual(getFakeGameRoom());
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return undefined;
        });
        gateway.leaveGame(socket, { roomId: getFakeGameRoom().roomId, username: 'fakeUsername2' });
    });

    it('playerRejected should emit PlayerRejected with the game room', () => {
        const room = getFakeGameRoom();
        room.userGame.potentialPlayers = ['fakeUsername2'];
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(GameModeEvents.PlayerRejected);
                expect(gameInfo).toEqual(getFakeGameRoom());
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return room;
        });
        gateway.playerRejected(socket, { roomId: getFakeGameRoom().roomId, username: 'fakeUsername2' });
        expect(gameModeService.getGameRoom(getFakeGameRoom().roomId).userGame.potentialPlayers).toEqual([]);
    });

    it('playerAccepted should emit PlayerAccepted with the game room', () => {
        const room = getFakeGameRoom();
        room.userGame.potentialPlayers = [];
        room.userGame.username2 = 'fakeUsername2';
        room.started = true;
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(GameModeEvents.PlayerAccepted);
                expect(gameInfo).toEqual(room);
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            return room;
        });
        gateway.playerAccepted(socket, { roomId: getFakeGameRoom().roomId, username: 'fakeUsername2' });
        expect(gameModeService.getGameRoom(getFakeGameRoom().roomId).userGame.potentialPlayers).toEqual(room.userGame.potentialPlayers);
    });

    it('changeTime should call applyTimeToTimer', () => {
        jest.spyOn(gameModeService, 'applyTimeToTimer').mockImplementation(() => {
            return;
        });
        gateway.changeTime(socket, { roomId: getFakeGameRoom().roomId, time: 1 });
        expect(gameModeService.applyTimeToTimer).toHaveBeenCalledWith(getFakeGameRoom().roomId, 1);
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
        gameForm: {
            name: 'FakeGame',
            nbDifference: 2,
            image1url: `${environment.serverUrl}/FakeGame/image1.bmp`,
            image2url: `${environment.serverUrl}/FakeGame/image2.bmp`,
            difficulty: 'Facile',
            soloBestTimes: [new BestTime(), new BestTime(), new BestTime()],
            vsBestTimes: [new BestTime(), new BestTime(), new BestTime()],
        },
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