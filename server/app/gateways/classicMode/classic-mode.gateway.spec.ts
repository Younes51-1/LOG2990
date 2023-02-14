import { environment } from '@app/environments/environment';
import { BestTime } from '@app/model/schema/best-times.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, match, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';
import { ClassicModeGateway } from './classic-mode.gateway';
import { ClassicModeEvents } from './classic-mode.gateway.events';

describe('ClassicModeGateway', () => {
    let gateway: ClassicModeGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: Socket;
    let server: SinonStubbedInstance<Server>;
    let classicModeService: SinonStubbedInstance<ClassicModeService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        classicModeService = createStubInstance(ClassicModeService);
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
        gateway.startGame(socket, getFakeUserGame());
        expect(socket.emit.calledWith(ClassicModeEvents.Started, match.any)).toBeTruthy();
    });

    // it('validateDifference should emit difference validated with true if difference is valid', async () => {
    //     const differencePos = new Vector2D();
    //     differencePos.x = 1;
    //     differencePos.y = 1;
    //     await gateway.validateDifference(socket, differencePos);
    //     expect(socket.emit.calledWith(ClassicModeEvents.DifferenceValidated, { validated: true, differencePos })).toBeTruthy();
    // });

    // it('validateDifference should emit difference validated with false if difference is not valid', async () => {
    //     const differencePos = new Vector2D();
    //     differencePos.x = 0;
    //     differencePos.y = 0;
    //     await gateway.validateDifference(socket, differencePos);
    //     expect(socket.emit.calledWith(ClassicModeEvents.DifferenceValidated, { validated: false, differencePos })).toBeTruthy();
    // });

    // it('validateDifference should emit difference validated and end the game if no more differences', async () => {
    //     const differencePos = new Vector2D();
    //     differencePos.x = 1;
    //     differencePos.y = 1;
    //     await gateway.validateDifference(socket, differencePos);
    //     await gateway.validateDifference(socket, differencePos);
    //     expect(socket.emit.calledWith(ClassicModeEvents.DifferenceValidated, { validated: true, differencePos })).toBeTruthy();
    //     expect(socket.emit.calledWith(ClassicModeEvents.EndGame, match.any)).toBeTruthy();
    // });

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

const getFakeUserGame = (): UserGame => ({
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
