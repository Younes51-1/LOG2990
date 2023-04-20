/* eslint-disable max-lines */
import { WaitingRoomEvents } from '@app/enum/waiting-room.gateway.variables';
import { environment } from '@app/environments/environment.prod';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { BestTime } from '@app/model/schema/best-time.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { GameMode } from '@common/game-mode';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('WaitingRoomGateway', () => {
    let gateway: WaitingRoomGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameModeService: SinonStubbedInstance<GameModeService>;
    let gameHistoryService: SinonStubbedInstance<GameHistoryService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        gameModeService = createStubInstance(GameModeService);
        gameHistoryService = createStubInstance(GameHistoryService);

        Object.defineProperty(socket, 'id', { value: getFakeGameRoom().roomId, writable: true });

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
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('startGame should call saveGameHistory and emit started', () => {
        jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(getFakeGameRoom());
        const saveGameHistorySpy = jest.spyOn(gameModeService, 'saveGameHistory').mockImplementation();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.Started);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.startGame(socket, getFakeGameRoom().roomId);
        expect(saveGameHistorySpy).toHaveBeenCalled();
    });

    it('createGame should initNewRoom and emit created and gameFound if not started', () => {
        const initNewRoomSpy = jest.spyOn(gameModeService, 'initNewRoom').mockImplementation();
        server.to.returns({
            emit: (event: string, roomId: string) => {
                expect(event).toEqual(WaitingRoomEvents.GameCreated || WaitingRoomEvents.GameFound);
                expect(roomId).toEqual(getFakeGameRoom().roomId);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.createGame(socket, getFakeGameRoom());
        expect(initNewRoomSpy).toHaveBeenCalled();
    });

    it('joinGame should emit the gameRoom if the game is joinable', () => {
        const fakeGameRoom = getFakeGameRoom();
        const joinGameSpy = jest.spyOn(gameModeService, 'joinGame').mockReturnValue(true);
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(fakeGameRoom);
        server.to.returns({
            emit: (event: string, gameRoomReturned: GameRoom) => {
                expect(event).toEqual(WaitingRoomEvents.GameFound);
                expect(gameRoomReturned).toEqual(fakeGameRoom);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinGame(socket, {
            gameName: fakeGameRoom.userGame.gameData.name,
            username: fakeGameRoom.userGame.username1,
            gameMode: fakeGameRoom.gameMode,
        });
        expect(joinGameSpy).toHaveBeenCalled();
        expect(getGameSpy).toHaveBeenCalled();
    });

    it('joinGame should not emit the gameRoom if the game is not joinable', () => {
        const fakeGameRoom = getFakeGameRoom();
        const joinGameSpy = jest.spyOn(gameModeService, 'joinGame').mockReturnValue(false);
        server.to.returns({
            emit: (event: string, gameRoomReturned: GameRoom) => {
                expect(event).toEqual(WaitingRoomEvents.GameFound);
                expect(gameRoomReturned).toEqual(undefined);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinGame(socket, {
            gameName: fakeGameRoom.userGame.gameData.name,
            username: fakeGameRoom.userGame.username1,
            gameMode: fakeGameRoom.gameMode,
        });
        expect(joinGameSpy).toHaveBeenCalled();
    });

    it('joinGame should emit the gameRoom if the game is joinable and call playerAccepted in limited-time-mode', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.gameMode = GameMode.limitedTimeMode;
        const joinGameSpy = jest.spyOn(gameModeService, 'joinGame').mockReturnValue(true);
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(fakeGameRoom);
        const playerAcceptedSpy = jest.spyOn(gateway, 'playerAccepted').mockImplementation();
        server.to.returns({
            emit: (event: string, gameRoomReturned: GameRoom) => {
                expect(event).toEqual(WaitingRoomEvents.GameFound);
                expect(gameRoomReturned).toEqual(fakeGameRoom);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinGame(socket, {
            gameName: fakeGameRoom.userGame.gameData.name,
            username: fakeGameRoom.userGame.username1,
            gameMode: fakeGameRoom.gameMode,
        });
        expect(joinGameSpy).toHaveBeenCalled();
        expect(playerAcceptedSpy).toHaveBeenCalled();
        expect(getGameSpy).toHaveBeenCalled();
    });

    it('abortGameCreation should deleteRoom and emit GameDeleted and canceled if not started', () => {
        const deleteRoomSpy = jest.spyOn(gameModeService, 'deleteGameRoom').mockImplementation();
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(getFakeGameRoom());
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(WaitingRoomEvents.GameDeleted || WaitingRoomEvents.GameCanceled);
                expect(data).toEqual(
                    getFakeGameRoom() || { gameName: getFakeGameRoom().userGame.gameData.name, gameMode: getFakeGameRoom().gameMode },
                );
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.abortGameCreation(socket, getFakeGameRoom().roomId);
        expect(deleteRoomSpy).toHaveBeenCalled();
        expect(getGameSpy).toHaveBeenCalled();
    });

    it('abortGameCreation should do nothing if the gameRoom is undefined', () => {
        const deleteRoomSpy = jest.spyOn(gameModeService, 'deleteGameRoom').mockImplementation();
        jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(undefined);
        gateway.abortGameCreation(socket, getFakeGameRoom().roomId);
        expect(deleteRoomSpy).not.toHaveBeenCalled();
    });

    it('playerRejected should remove player from potentialPlayers and emit playerRejected', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.potentialPlayers = ['potentialPlayer'];
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(fakeGameRoom);
        jest.spyOn(gameModeService, 'setGameRoom').mockImplementation();
        server.to.returns({
            emit: (event: string, gameRoomReturned: GameRoom) => {
                expect(event).toEqual(WaitingRoomEvents.PlayerRejected);
                expect(gameRoomReturned.userGame.potentialPlayers).toEqual([]);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.playerRejected(socket, { roomId: fakeGameRoom.roomId, username: 'potentialPlayer' });
        expect(getGameSpy).toHaveBeenCalled();
    });

    it('playerRejected should do nothing if the gameRoom is undefined', () => {
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(undefined);
        const setGameRoomSpy = jest.spyOn(gameModeService, 'setGameRoom').mockImplementation();
        gateway.playerRejected(socket, { roomId: getFakeGameRoom().roomId, username: 'potentialPlayer' });
        expect(getGameSpy).toHaveBeenCalled();
        expect(setGameRoomSpy).not.toHaveBeenCalled();
    });

    it('playerAccepted should emit gameRoom with new username2 set and started at true', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.potentialPlayers = ['potentialPlayer'];
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(fakeGameRoom);
        const setGameRoomSpy = jest.spyOn(gameModeService, 'setGameRoom').mockImplementation();
        server.to.returns({
            emit: (event: string, gameRoomReturned: GameRoom) => {
                expect(event).toEqual(WaitingRoomEvents.PlayerAccepted);
                expect(gameRoomReturned.userGame.potentialPlayers).toEqual([]);
                expect(gameRoomReturned.userGame.username2).toEqual('potentialPlayer');
                expect(gameRoomReturned.started).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.playerAccepted(socket, { roomId: fakeGameRoom.roomId, username: 'potentialPlayer' });
        expect(getGameSpy).toHaveBeenCalled();
        expect(setGameRoomSpy).toHaveBeenCalled();
    });

    it('leaveGame should remove player from potentialPlayers and emit gameInfo updated', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.potentialPlayers = ['potentialPlayer'];
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(fakeGameRoom);
        jest.spyOn(gameModeService, 'setGameRoom').mockImplementation();
        server.to.returns({
            emit: (event: string, gameRoomReturned: GameRoom) => {
                expect(event).toEqual(WaitingRoomEvents.GameInfo);
                expect(gameRoomReturned.userGame.potentialPlayers).toEqual([]);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.leaveGame(socket, { roomId: fakeGameRoom.roomId, username: 'potentialPlayer' });
        expect(getGameSpy).toHaveBeenCalled();
    });

    it('leaveGame should do nothing if the gameRoom does not exists', () => {
        const fakeGameRoom = getFakeGameRoom();
        const getGameSpy = jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(undefined);
        const setGameSpy = jest.spyOn(gameModeService, 'setGameRoom').mockImplementation();
        gateway.leaveGame(socket, { roomId: fakeGameRoom.roomId, username: 'potentialPlayer' });
        expect(getGameSpy).toHaveBeenCalled();
        expect(setGameSpy).not.toHaveBeenCalled();
    });

    it('handleDisconnect should call abortGameCreation if its the creator disconnecting', () => {
        const abortGameCreationSpy = jest.spyOn(gateway, 'abortGameCreation').mockImplementation();
        jest.spyOn(gameModeService, 'getGameRoom').mockReturnValue(getFakeGameRoom());
        gateway.handleDisconnect(socket);
        expect(abortGameCreationSpy).toHaveBeenCalled();
    });

    it('handleDisconnect should call leaveGame if its not the creator disconnecting', () => {
        const leaveGameSpy = jest.spyOn(gateway, 'leaveGame').mockImplementation();
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            const fakeGameRoom = getFakeGameRoom();
            fakeGameRoom.roomId = 'FakeRoomId';
            return fakeGameRoom;
        });
        gateway.handleDisconnect(socket);
        expect(leaveGameSpy).toHaveBeenCalled();
    });

    it('handleDisconnect should do nothing if the gameRoom has started already', () => {
        const abortGameCreationSpy = jest.spyOn(gateway, 'abortGameCreation').mockImplementation();
        const leaveGameSpy = jest.spyOn(gateway, 'leaveGame').mockImplementation();
        jest.spyOn(gameModeService, 'getGameRoom').mockImplementation(() => {
            const fakeGameRoom = getFakeGameRoom();
            fakeGameRoom.started = true;
            return fakeGameRoom;
        });
        gateway.handleDisconnect(socket);
        expect(abortGameCreationSpy).not.toHaveBeenCalled();
        expect(leaveGameSpy).not.toHaveBeenCalled();
    });
});

/* eslint-disable @typescript-eslint/no-magic-numbers */
const getFakeUserGame = (): UserGame => ({
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
        soloBestTimes: newBestTimes(),
        vsBestTimes: newBestTimes(),
    },
});

const newBestTimes = (): BestTime[] => [
    { name: 'Joueur 1', time: 60 },
    { name: 'Joueur 2', time: 120 },
    { name: 'Joueur 3', time: 180 },
];

const getFakeGameRoom = (): GameRoom => ({
    userGame: getFakeUserGame(),
    roomId: 'socketId',
    started: false,
    gameMode: GameMode.classicMode,
});
