// We want to assign a value to the private field
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { environment } from '@app/environments/environment.prod';
import { GameHistory } from '@app/model/database/game-history';
import { BestTime } from '@app/model/schema/best-time.schema';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { GameMode } from '@common/game-mode';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';

class TestGameModeService extends GameModeService {
    addElementToMap(key: string, value: GameRoom) {
        (this as any).gameRooms.set(key, value);
    }

    addElementToHistoryMap(key: string, value: GameHistory) {
        (this as any).gameHistory.set(key, value);
    }
}

describe('GameModeService', () => {
    let service: GameModeService;
    let testGameModeService: TestGameModeService;
    let socket: SinonStubbedInstance<Socket>;
    let gameHistoryService: GameHistoryService;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        gameHistoryService = createStubInstance<GameHistoryService>(GameHistoryService);

        Object.defineProperty(socket, 'id', { value: getFakeGameRoom().roomId, writable: true });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: GameModeService,
                    useClass: TestGameModeService,
                },
                {
                    provide: GameHistoryService,
                    useValue: gameHistoryService,
                },
                TestGameModeService,
            ],
        }).compile();

        service = module.get<GameModeService>(GameModeService);
        testGameModeService = module.get<TestGameModeService>(TestGameModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getGameRoom should return room if the roomId is defined', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toEqual(newRoom);
    });

    it('getGameRoom should return room defined by the name and gamemode', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(undefined, newRoom.userGame.gameData.name, newRoom.gameMode)).toEqual(newRoom);
    });

    it('getGameRoom should not return room defined by the name and gamemode if it has started', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        newRoom.started = true;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(undefined, newRoom.userGame.gameData.name, newRoom.gameMode)).toEqual(undefined);
    });

    it('getGameRoom should return room defined by gamemode (time-limited)', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = GameMode.limitedTimeMode;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(undefined, undefined, newRoom.gameMode)).toEqual(newRoom);
    });

    it('getGameRoom should return undefined if the game does not exists', () => {
        const newRoom = getFakeGameRoom();
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toEqual(undefined);
    });

    it('getGameRoom should not return the gameRoom if started is true', () => {
        const newRoom = getFakeGameRoom();
        newRoom.started = true;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(newRoom.userGame.gameData.name)).toEqual(undefined);
    });

    it('getGameRoom should not return undefined if no game is found', () => {
        expect(testGameModeService.getGameRoom('notaRealGame')).toEqual(undefined);
    });

    it('setGameRoom should add room', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.setGameRoom(newRoom);
        expect((testGameModeService as any).gameRooms.get(newRoom.roomId)).toEqual(newRoom);
    });

    it('getGameHistory should return gameHistory', () => {
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        expect(testGameModeService.getGameHistory(getFakeGameRoom().roomId)).toEqual(newGameHistory);
    });

    it('setGameHistory should add history', () => {
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.setGameHistory(getFakeGameRoom().roomId, newGameHistory);
        expect((testGameModeService as any).gameHistory.get(getFakeGameRoom().roomId)).toEqual(newGameHistory);
    });

    it('deleteGameHistory should delete gameHistory', () => {
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.deleteGameHistory(getFakeGameRoom().roomId);
        expect(testGameModeService.getGameRoom(getFakeGameRoom().roomId)).toEqual(undefined);
    });

    it('deleteGameRoom should delete room', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.deleteGameRoom(newRoom.roomId);
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toBeUndefined();
    });

    it('nextGame should set the next gameRoom', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = GameMode.limitedTimeMode;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        const newRoomModified = newRoom;
        newRoomModified.userGame.gameData.name = 'anotherFakeGame';
        testGameModeService.nextGame(newRoomModified);
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toEqual(newRoomModified);
    });

    it('nextGame should do nothing if its a mode classique game', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        const newRoomModified = newRoom;
        newRoomModified.userGame.gameData.name = 'anotherFakeGame';
        testGameModeService.nextGame(newRoomModified);
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toEqual(newRoom);
    });

    it('joinGame should return true when socket has joined the game', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        const newRoom = getFakeGameRoom();
        socket.join.returns();
        expect(
            service.joinGame(socket, { gameName: newRoom.userGame.gameData.name, username: 'FakeUserJoining', gameMode: GameMode.classicMode }),
        ).toEqual(true);
        jest.spyOn(service, 'getGameRoom').mockRestore();
        expect(service.getGameRoom(newRoom.roomId).userGame.potentialPlayers).toContain('FakeUserJoining');
    });

    it('joinGame should return false if the gameName is undefined', () => {
        expect(service.joinGame(socket, { gameName: undefined, username: 'FakeUser', gameMode: GameMode.classicMode })).toEqual(false);
    });

    it('saveGameHistory should correctly save game history with classic gamemode when only one username', () => {
        const fakeGameRoom = getFakeGameRoom();
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode Classique solo');
    });

    it('saveGameHistory should correctly save game history with classic gamemode when has two usernames', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.username2 = 'FakeUser2';
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).username2).toEqual(fakeGameRoom.userGame.username2);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode Classique un contre un');
    });

    it('saveGameHistory should correctly save game history with time-limited gamemode when only one username', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.gameMode = GameMode.limitedTimeMode;
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode Temps Limité solo');
    });

    it('saveGameHistory should correctly save game history with time-limited gamemode when two usernames', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.username2 = 'FakeUser2';
        fakeGameRoom.gameMode = GameMode.limitedTimeMode;
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode Temps Limité coopératif');
    });

    it('validateDifference should return true if the difference is valid', () => {
        const newRoom = getFakeGameRoom();
        const position = new Vector2D();
        position.x = 1;
        position.y = 1;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.validateDifference(newRoom.roomId, position)).toBeTruthy();
    });

    it('validateDifference should return false if the difference is not valid', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.validateDifference(newRoom.roomId, { x: 0, y: 0 })).toBeFalsy();
    });

    it('validateDifference should return false if gameRoom is undefined', () => {
        expect(testGameModeService.validateDifference(getFakeGameRoom().roomId, { x: 0, y: 0 })).toBeFalsy();
    });

    it('isGameFinished should return true if all differences have been found on mode classique', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.getGameRoom(newRoom.roomId).userGame.nbDifferenceFound = 2;
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeTruthy();
    });

    it('isGameFinished should return false if the gameRoom does not exists', () => {
        const newRoom = getFakeGameRoom();
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeFalsy();
    });

    it('isGameFinished should return false if not all differences have been found', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.getGameRoom(newRoom.roomId).userGame.nbDifferenceFound = 1;
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeFalsy();
    });

    it('isGameFinished should return true if timer is 0 on time-limited', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = GameMode.limitedTimeMode;
        newRoom.userGame.timer = 0;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeTruthy();
    });

    it('isGameFinished should return false if timer is above 0 on time-limited', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = GameMode.limitedTimeMode;
        newRoom.userGame.timer = 10;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeFalsy();
    });

    it('abandonGameHistory should correctly update game history when game was abandoned', () => {
        (testGameModeService as any).gameHistory = new Map();
        jest.spyOn(service, 'getGameHistory').mockReturnValue(getFakeGameHistory());
        jest.spyOn(service as any, 'updateGameHistory').mockImplementation();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        service.abandonGameHistory(getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1);
        expect((service as any).updateGameHistory).toHaveBeenCalled();
    });

    it('abandonGameHistory should correctly update game history when game was abandoned and we are in a multiplayer lobby', () => {
        (testGameModeService as any).gameHistory = new Map();
        jest.spyOn(service, 'getGameHistory').mockImplementation(() => {
            const gameHistory = getFakeGameHistory();
            gameHistory.username2 = 'FakeUser2';
            return gameHistory;
        });
        service.abandonGameHistory(getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1);
        jest.spyOn(service, 'getGameHistory').mockRestore();
        expect(service.getGameHistory(getFakeGameRoom().roomId).abandoned).toEqual(['FakeUser']);
    });

    it('initNewRoom should create a new room with the given id', () => {
        const roomId = 'socketId';
        socket.join.returns();
        service.initNewRoom(socket, getFakeGameRoom());
        expect(service.getGameRoom(roomId)).toBeDefined();
    });

    it('canJoinGame should return undefined if the game does not exist', () => {
        expect(
            service.canJoinGame({ gameName: getFakeGameRoom().userGame.gameData.name, username: 'FakeUser', gameMode: GameMode.classicMode }),
        ).toBeUndefined();
    });

    it('canJoinGame should return undefined if the player is the user 1', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            const room = getFakeGameRoom();
            room.userGame.potentialPlayers = undefined;
            return room;
        });
        expect(
            service.canJoinGame({ gameName: getFakeGameRoom().userGame.gameData.name, username: 'FakeUser', gameMode: GameMode.classicMode }),
        ).toBeUndefined();
    });

    it('canJoinGame should return undefined if the user is already in the potentialPlayer list', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            const newRoom = getFakeGameRoom();
            newRoom.userGame.potentialPlayers.push('FakeUser2');
            return newRoom;
        });
        expect(
            service.canJoinGame({
                gameName: getFakeGameRoom().userGame.gameData.name,
                username: 'FakeUser2',
                gameMode: GameMode.classicMode,
            }),
        ).toBeUndefined();
    });

    it('canJoinGame should return the gameRoom if the game is joinable', () => {
        jest.spyOn(service, 'getGameRoom').mockReturnValue(getFakeGameRoom());
        expect(
            service.canJoinGame({
                gameName: getFakeGameRoom().userGame.gameData.name,
                username: 'FakeUser2',
                gameMode: GameMode.classicMode,
            }),
        ).toEqual(getFakeGameRoom());
    });

    it('applyTimeToTimer should correctly add time to userGame timer', () => {
        const fakeGameRoom = getFakeGameRoom();
        jest.spyOn(service, 'getGameRoom').mockReturnValue(fakeGameRoom);
        jest.spyOn(service, 'setGameRoom').mockImplementation();
        const time = 10;
        service.applyTimeToTimer(fakeGameRoom.roomId, time);
        expect(fakeGameRoom.userGame.timer).toEqual(time);
    });

    it('getRoomsValues should return an array of game rooms', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getRoomsValues()).toEqual([newRoom]);
    });

    it('applyTimeToTimer should do nothing if gameRoom does not exists', () => {
        const fakeGameRoom = getFakeGameRoom();
        const setGameRoomSpy = jest.spyOn(service, 'setGameRoom').mockImplementation();
        const time = 10;
        service.applyTimeToTimer(fakeGameRoom.roomId, time);
        expect(setGameRoomSpy).not.toHaveBeenCalled();
    });

    it('updateTimer should increment timer in mode classique', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(1);
    });

    it('updateTimer should decrement timer in mode classique', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = GameMode.limitedTimeMode;
        newRoom.userGame.timer = 10;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(9);
    });

    it('updateTimer should decrement timer to 120 if above limit in time-limited mode', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = GameMode.limitedTimeMode;
        newRoom.userGame.timer = 1000;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(120);
    });

    it('updateTimer should put timer at 0 if it is below 0 in time-limited mode', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = GameMode.limitedTimeMode;
        newRoom.userGame.timer = -10;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(0);
    });

    it('endGame should save game history and remove game room', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        const updateGameHistorySpy = jest.spyOn(testGameModeService as any, 'updateGameHistory').mockImplementation();
        const saveGameHistorySpy = jest.spyOn(gameHistoryService, 'saveGameHistory').mockImplementation();
        jest.spyOn(testGameModeService, 'getGameHistory').mockReturnValue(getFakeGameHistory());
        testGameModeService.endGame(getEndGame());
        expect(updateGameHistorySpy).toHaveBeenCalled();
        expect(saveGameHistorySpy).toHaveBeenCalled();
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toBeUndefined();
    });

    it('abandonClassicMode should correctly save game history', () => {
        const abandonGameHistorySpy = jest.spyOn(service, 'abandonGameHistory').mockImplementation();
        const saveGameHistorySpy = jest.spyOn(gameHistoryService, 'saveGameHistory').mockImplementation();
        service.abandonClassicMode(getFakeGameRoom(), getFakeGameRoom().userGame.username1);
        expect(abandonGameHistorySpy).toHaveBeenCalled();
        expect(saveGameHistorySpy).toHaveBeenCalled();
    });

    it('abandonLimitedTimeMode should change username if user 1 quit and update gameRoom and history', () => {
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        newRoom.userGame.username2 = 'FakeUser2';
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(newRoom.roomId, newGameHistory);
        testGameModeService.abandonLimitedTimeMode(newRoom, newRoom.userGame.username1, newRoom.roomId);
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.username1).toEqual('FakeUser2');
        expect(testGameModeService.getGameHistory(newRoom.roomId).abandoned).toEqual(['FakeUser']);
    });

    it('abandonLimitedTimeMode should change username if user quit and update gameRoom and history', () => {
        const saveGameHistorySpy = jest.spyOn(gameHistoryService, 'saveGameHistory').mockImplementation();
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(newRoom.roomId, newGameHistory);
        testGameModeService.abandonLimitedTimeMode(newRoom, newRoom.userGame.username1, newRoom.roomId);
        expect(saveGameHistorySpy).toHaveBeenCalled();
        expect(testGameModeService.getGameHistory(newRoom.roomId).abandoned).toEqual(['FakeUser']);
    });

    it('updateGameHistory should correctly update game history when user is the winner', () => {
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        jest.spyOn(Date, 'now').mockReturnValue(20);
        const fakeEndGame: EndGame = {
            winner: true,
            roomId: getFakeGameRoom().roomId,
            username: getFakeGameHistory().username1,
            gameFinished: true,
        };
        const fakeGameRoom = getFakeGameRoom();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.addElementToMap(fakeGameRoom.roomId, fakeGameRoom);
        (testGameModeService as any).updateGameHistory(fakeEndGame);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).winner).toEqual('FakeUser');
    });

    it('updateGameHistory should correctly update game history when game was abandoned', () => {
        (testGameModeService as any).gameHistory = new Map();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        jest.spyOn(Date, 'now').mockReturnValue(20);
        const newGameHistory = getFakeGameHistory();
        const fakeEndGame: EndGame = {
            winner: false,
            roomId: getFakeGameRoom().roomId,
            username: getFakeGameHistory().username1,
            gameFinished: false,
        };
        const fakeGameRoom = getFakeGameRoom();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.addElementToMap(fakeGameRoom.roomId, fakeGameRoom);
        (testGameModeService as any).updateGameHistory(fakeEndGame);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).abandoned).toEqual(['FakeUser']);
    });

    it('updateGameHistory should correctly update game history with no winners if its a solo game', () => {
        (testGameModeService as any).gameHistory = new Map();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        jest.spyOn(Date, 'now').mockReturnValue(20);
        const newGameHistory = getFakeGameHistory();
        const fakeEndGame: EndGame = {
            winner: false,
            roomId: getFakeGameRoom().roomId,
            username: getFakeGameHistory().username1,
            gameFinished: true,
        };
        const fakeGameRoom = getFakeGameRoom();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.addElementToMap(fakeGameRoom.roomId, fakeGameRoom);
        (testGameModeService as any).updateGameHistory(fakeEndGame);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).winner).toEqual('Aucun gagnant');
    });

    it('GameRoom should be of type GameRoom', () => {
        const newRoom = new GameRoom();
        expect(newRoom).toBeInstanceOf(GameRoom);
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

const getFakeGameRoom = (): GameRoom => ({
    userGame: getFakeUserGame(),
    roomId: 'socketId',
    started: false,
    gameMode: GameMode.classicMode,
});

const getFakeGameHistory = (): GameHistory => ({
    name: 'FakeGame',
    startTime: 10,
    timer: 0,
    username2: undefined,
    username1: 'FakeUser',
    gameMode: GameMode.classicMode,
    abandoned: undefined,
    winner: undefined,
});

const newBestTimes = (): BestTime[] => [
    { name: 'Player 1', time: 60 },
    { name: 'Player 2', time: 120 },
    { name: 'Player 3', time: 180 },
];

const getEndGame = (): EndGame => ({
    winner: true,
    roomId: 'socketId',
    username: 'FakeUser',
    gameFinished: true,
});
