import { environment } from '@app/environments/environment';
import { BestTime } from '@app/model/schema/best-times.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
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

    it('startGame should connect socket to new room and emit the room id with code started', () => {
        const initNewRoomSpy = jest.spyOn(classicModeService, 'initNewRoom').mockImplementation(() => {
            return 'socketId';
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.Started);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.startGame(socket, getFakeUserGame1());
        expect(initNewRoomSpy).toHaveBeenCalled();
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
        await gateway.validateDifference(socket, differencePos);
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
        await gateway.validateDifference(socket, differencePos);
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
        await gateway.validateDifference(socket, differencePos);
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
        gateway.endGame(socket);
    });

    it('afterInit() should emit time after 1s to connected socket', () => {
        const emitTimeSpy = jest.spyOn(gateway, 'emitTime');
        myMapStub.get.withArgs(getFakeGameRoom().roomId).returns(getFakeGameRoom());
        myMapStub.values.returns([getFakeGameRoom()] as unknown as IterableIterator<GameRoom>);
        jest.useFakeTimers();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.Timer);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.afterInit();
        jest.advanceTimersByTime(DelayBeforeEmmitingTime.DELAY_BEFORE_EMITTING_TIME);
        expect(emitTimeSpy).toHaveBeenCalled();
    });

    it('Waiting message should be sent on connection and connection to be logged', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ClassicModeEvents.Waiting);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleConnection(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        const deleteRoomSpy = jest.spyOn(classicModeService, 'deleteRoom').mockImplementation();
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
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
});

/* eslint-disable @typescript-eslint/no-magic-numbers */
const getFakeUserGame1 = (): UserGame => ({
    username: 'FakeUser',
    nbDifferenceFound: 0,
    timer: 0,
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
});
