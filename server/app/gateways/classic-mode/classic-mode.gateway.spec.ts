/* eslint-disable max-lines */
import { environment } from '@app/environments/environment.prod';
import { BestTime } from '@app/model/schema/best-times.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ClassicModeGateway } from './classic-mode.gateway';
import { ClassicModeEvents, DelayBeforeEmmitingTime } from './classic-mode.gateway.variables';

describe('ClassicModeGateway', () => {
    let gateway: ClassicModeGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let classicModeService: SinonStubbedInstance<ClassicModeService>;
    let myMapStub: SinonStubbedInstance<Map<string, GameRoom>>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        classicModeService = createStubInstance(ClassicModeService);
        socket = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket, 'id', { value: getFakeGameRoom().roomId, writable: true });
        server = createStubInstance<Server>(Server);
        myMapStub = createStubInstance<Map<string, GameRoom>>(Map);
        classicModeService.gameRooms = myMapStub;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassicModeGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: ClassicModeService,
                    useValue: classicModeService,
                },
            ],
        }).compile();

        gateway = module.get<ClassicModeGateway>(ClassicModeGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('createGame should connect socket to new room and emit the room id with code started', () => {
        const initNewRoomSpy = jest.spyOn(classicModeService, 'initNewRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.GameCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.createGame(socket, getFakeGameRoom());
        expect(initNewRoomSpy).toHaveBeenCalled();
    });

    it('startGame should emit Started', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.Started);
            },
        } as BroadcastOperator<unknown, unknown>);
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(getFakeGameRoom());
        gateway.startGame(socket, getFakeGameRoom().roomId);
    });

    it('checkGame should emit gameFound with the game name if one room was found', () => {
        const getGameRoomSpy = jest.spyOn(classicModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(ClassicModeEvents.GameFound);
                expect(gameName).toEqual(getFakeGameRoom().userGame.gameData.gameForm.name);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.checkGame(socket, getFakeGameRoom().userGame.gameData.gameForm.name);
        expect(getGameRoomSpy).toHaveBeenCalled();
    });

    it('canJoinGame should emit true if the user can join and false otherwise', () => {
        const canJoinGameSpy = jest.spyOn(classicModeService, 'canJoinGame').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.CanJoinGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.canJoinGame(socket, [getFakeGameRoom().userGame.gameData.gameForm.name, getFakeGameRoom().userGame.username2]);
        expect(canJoinGameSpy).toHaveBeenCalled();
    });

    it('canJoinGame should emit false when the game cannot be joined', () => {
        const canJoinGameSpy = jest.spyOn(classicModeService, 'canJoinGame').mockImplementation(() => {
            return undefined;
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.CannotJoinGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.canJoinGame(socket, [getFakeGameRoom().userGame.gameData.gameForm.name, getFakeGameRoom().userGame.username2]);
        expect(canJoinGameSpy).toHaveBeenCalled();
    });

    it('joinGame should emit gameInfo with the game info if the user did join', () => {
        const joinGameSpy = jest.spyOn(classicModeService, 'joinGame').mockImplementation(() => {
            return true;
        });
        const getGameRoomSpy = jest.spyOn(classicModeService, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(ClassicModeEvents.GameInfo);
                expect(gameInfo).toEqual(getFakeGameRoom());
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinGame(socket, [getFakeGameRoom().userGame.gameData.gameForm.name, getFakeGameRoom().userGame.username2]);
        expect(joinGameSpy).toHaveBeenCalled();
        expect(getGameRoomSpy).toHaveBeenCalled();
    });

    it('joinGame should emit gameInfo with the game info if the user did join', () => {
        const joinGameSpy = jest.spyOn(classicModeService, 'joinGame').mockImplementation(() => {
            return false;
        });
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(ClassicModeEvents.GameInfo);
                expect(gameInfo).toEqual(undefined);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinGame(socket, [getFakeGameRoom().userGame.gameData.gameForm.name, getFakeGameRoom().userGame.username2]);
        expect(joinGameSpy).toHaveBeenCalled();
    });

    it('abortGameCreation should emit gameCreationAborted', () => {
        const abortGameCreationSpy = jest.spyOn(classicModeService, 'deleteRoom').mockImplementation();
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(ClassicModeEvents.GameDeleted);
                expect(gameName).toEqual(getFakeGameRoom().userGame.gameData.gameForm.name);
            },
        } as BroadcastOperator<unknown, unknown>);
        server.to.returns({
            emit: (event: string, gameName: string) => {
                expect(event).toEqual(ClassicModeEvents.GameCanceled);
                expect(gameName).toEqual(getFakeGameRoom().userGame.gameData.gameForm.name);
            },
        } as BroadcastOperator<unknown, unknown>);
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(getFakeGameRoom());
        gateway.abortGameCreation(socket);
        expect(abortGameCreationSpy).toHaveBeenCalled();
    });

    it('leaveGame should emit gameInfo with the game info if the user did leave', () => {
        const room = getFakeGameRoom();
        room.userGame.potentielPlayers = ['fakeUsername2'];
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(ClassicModeEvents.GameInfo);
                expect(gameInfo).toEqual(getFakeGameRoom());
            },
        } as BroadcastOperator<unknown, unknown>);
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(room);
        gateway.leaveGame(socket, [getFakeGameRoom().roomId, 'fakeUsername2']);
        expect(classicModeService.gameRooms.get(getFakeGameRoom().roomId).userGame.potentielPlayers).toEqual([]);
    });

    it('playerRejected should emit PlayerRejected with the game room', () => {
        const room = getFakeGameRoom();
        room.userGame.potentielPlayers = ['fakeUsername2'];
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toEqual(ClassicModeEvents.PlayerRejected);
                expect(gameInfo).toEqual(getFakeGameRoom());
            },
        } as BroadcastOperator<unknown, unknown>);
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(room);
        gateway.playerRejected(socket, [getFakeGameRoom().roomId, 'fakeUsername2']);
        expect(classicModeService.gameRooms.get(getFakeGameRoom().roomId).userGame.potentielPlayers).toEqual([]);
    });

    it('playerAccepted should emit PlayerAccepted with the game room', () => {
        const room = getFakeGameRoom();
        room.userGame.potentielPlayers = [];
        room.userGame.username2 = 'fakeUsername2';
        room.started = true;
        server.to.returns({
            emit: (event: string, gameInfo: GameRoom) => {
                expect(event).toMatch('player');
                expect(gameInfo).toEqual(room);
            },
        } as BroadcastOperator<unknown, unknown>);
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(room);
        gateway.playerAccepted(socket, [getFakeGameRoom().roomId, 'fakeUsername2']);
        expect(classicModeService.gameRooms.get(getFakeGameRoom().roomId).userGame.potentielPlayers).toEqual(room.userGame.potentielPlayers);
    });

    it('validateDifference should emit difference validated with true if difference is valid', async () => {
        const differencePos = new Vector2D();
        differencePos.x = 1;
        differencePos.y = 1;
        const validateDifferenceSpy = jest.spyOn(classicModeService, 'validateDifference').mockImplementation(() => {
            return true;
        });
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(ClassicModeEvents.DifferenceValidated);
                expect(validated).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.validateDifference(socket, [differencePos, getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1]);
        expect(validateDifferenceSpy).toHaveBeenCalled();
    });

    it('validateDifference should emit difference validated with false if difference is not valid', async () => {
        const differencePos = new Vector2D();
        differencePos.x = 0;
        differencePos.y = 0;
        const validateDifferenceSpy = jest.spyOn(classicModeService, 'validateDifference').mockImplementation(() => {
            return false;
        });
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(ClassicModeEvents.DifferenceValidated);
                expect(validated).toEqual(false);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.validateDifference(socket, [differencePos, getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1]);
        expect(validateDifferenceSpy).toHaveBeenCalled();
    });

    it('validateDifference should emit difference validated and end the game if no more differences', async () => {
        const differencePos = new Vector2D();
        differencePos.x = 1;
        differencePos.y = 1;
        const validateDifferenceSpy = jest.spyOn(classicModeService, 'validateDifference').mockImplementation(() => {
            return true;
        });
        const isGameFinishedSpy = jest.spyOn(classicModeService, 'isGameFinished').mockImplementation(() => {
            return true;
        });
        const endGameSpy = jest.spyOn(gateway, 'endGame').mockImplementation();
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(ClassicModeEvents.DifferenceValidated);
                expect(validated).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.validateDifference(socket, [differencePos, getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1]);
        expect(validateDifferenceSpy).toHaveBeenCalled();
        expect(isGameFinishedSpy).toHaveBeenCalled();
        expect(endGameSpy).toHaveBeenCalled();
    });

    it('endGame should emit endGame event with the timer', () => {
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(getFakeGameRoom());
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.GameFinished);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.endGame(socket, [getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1]);
    });

    it('endGame should do nothing if the gameRoom does not exist', () => {
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(undefined);
        gateway.endGame(socket, [getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1]);
        expect(logger.log.notCalled).toBeTruthy();
    });

    it('afterInit should have created an interval to emit time', () => {
        const emitTimeSpy = jest.spyOn(gateway, 'emitTime').mockImplementation();
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DelayBeforeEmmitingTime.DELAY_BEFORE_EMITTING_TIME);
        expect(emitTimeSpy).toHaveBeenCalled();
    });

    it('emitTime should emit time after 1s to connected socket', () => {
        const emitTimeSpy = jest.spyOn(gateway, 'emitTime');
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(getFakeGameRoom());
        myMapStub.values.returns([getFakeGameRoom()] as unknown as IterableIterator<GameRoom>);
        jest.useFakeTimers();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.Timer);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.emitTime();
        jest.advanceTimersByTime(DelayBeforeEmmitingTime.DELAY_BEFORE_EMITTING_TIME);
        expect(emitTimeSpy).toHaveBeenCalled();
    });

    it('socket connection should be logged', () => {
        gateway.handleConnection(socket);
        expect(logger.log.called).toBeTruthy();
    });

    it('socket disconnection should be logged and call deleteRoom', () => {
        const deleteRoomSpy = jest.spyOn(classicModeService, 'deleteRoom').mockImplementation();
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(getFakeGameRoom());
        gateway.handleDisconnect(socket);
        expect(logger.log.called).toBeTruthy();
        expect(deleteRoomSpy).toHaveBeenCalled();
    });

    it('cancelDeletedGame should emit gameCanceled event', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.GameCanceled);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.cancelDeletedGame('FakeGame');
    });

    it('Abandoned should emit Abandoned event with the username of the one quitting the game', () => {
        server.to.returns({
            emit: (event: string, player: string) => {
                expect(event).toEqual(ClassicModeEvents.Abandoned);
                expect(player).toEqual(getFakeGameRoom().userGame.username1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.abandoned(socket, [getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1]);
    });
});

/* eslint-disable @typescript-eslint/no-magic-numbers */
const getFakeUserGame1 = (): UserGame => ({
    username1: 'FakeUser',
    nbDifferenceFound: 0,
    timer: 0,
    potentielPlayers: [],
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
            difficulte: 'Facile',
            soloBestTimes: [new BestTime(), new BestTime(), new BestTime()],
            vsBestTimes: [new BestTime(), new BestTime(), new BestTime()],
        },
    },
});
/* eslint-enable @typescript-eslint/no-magic-numbers */

const getFakeGameRoom = (): GameRoom => ({
    userGame: getFakeUserGame1(),
    roomId: 'socketid',
    started: true,
});
