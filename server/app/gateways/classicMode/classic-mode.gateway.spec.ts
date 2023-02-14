import { environment } from '@app/environments/environment';
import { BestTime } from '@app/model/schema/best-times.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ClassicModeGateway } from './classic-mode.gateway';
import { ClassicModeEvents } from './classic-mode.gateway.events';

describe('ClassicModeGateway', () => {
    let gateway: ClassicModeGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let classicModeService: SinonStubbedInstance<ClassicModeService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        classicModeService = createStubInstance(ClassicModeService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

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
        gateway.startGame(socket, getFakeUserGame());
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
        await gateway.validateDifference(socket, differencePos);
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(ClassicModeEvents.DifferenceValidated);
                expect(validated).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.validateDifference(socket, differencePos);
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, { validated, _ }) => {
                expect(event).toEqual(ClassicModeEvents.DifferenceValidated);
                expect(validated).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, timer: number) => {
                expect(event).toEqual(ClassicModeEvents.GameFinished);
                expect(timer).toMatchObject(Number);
            },
        } as BroadcastOperator<unknown, unknown>);
        expect(validateDifferenceSpy).toHaveBeenCalled();
    });

    // it('endGame should emit endGame event with the timer', () => {
    //     gateway.endGame(socket);
    //     expect(socket.emit.calledWith(ClassicModeEvents.EndGame, match.number)).toBeTruthy();
    // });

    // it('afterInit() should emit time after 1s to connected socket', () => {
    //     jest.useFakeTimers();
    //     gateway.afterInit();
    //     gateway.startGame(socket, getFakeUserGame());
    //     jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
    //     expect(server.emit.calledWith(ClassicModeEvents.Timer, match.number)).toBeTruthy();
    // });

    // it('Waiting message should be sent on connection and connection to be logged', () => {
    //     gateway.handleConnection(socket);
    //     expect(logger.log.calledOnce).toBeTruthy();
    //     expect(socket.emit.calledWith(ClassicModeEvents.Waiting, match.any)).toBeTruthy();
    // });

    // it('socket disconnection should be logged', () => {
    //     gateway.handleDisconnect(socket);
    //     expect(logger.log.calledOnce).toBeTruthy();
    // });
});

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

const getFakeUserGame2 = (): UserGame => ({
    username: 'FakeUser',
    nbDifferenceFound: 1,
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
