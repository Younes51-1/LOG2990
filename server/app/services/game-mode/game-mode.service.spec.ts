/* eslint-disable max-lines */
import { environment } from '@app/environments/environment.prod';
import { GameHistory } from '@app/model/database/game-history';
import { BestTime } from '@app/model/schema/best-times.schema';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeService } from '@app/services/game-mode/game-mode.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';

class TestGameModeService extends GameModeService {
    addElementToMap(key: string, value: GameRoom) {
        // We want to assign a value to the private field
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).gameRooms.set(key, value);
    }

    addElementToHistoryMap(key: string, value: GameHistory) {
        // We want to assign a value to the private field
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    it('initNewRoom should create a new room with the given id', () => {
        const roomId = 'socketId';
        socket.join.returns();
        service.initNewRoom(socket, getFakeGameRoom());
        expect(service.getGameRoom(roomId)).toBeDefined();
    });

    it('canJoinGame should return undefined if the game does not exist', () => {
        expect(
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.name, username: 'FakeUser', gameMode: 'mode classique' }),
        ).toEqual(null);
    });

    it('canJoinGame should return undefined if the player is the user 1', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            const room = getFakeGameRoom();
            room.userGame.potentialPlayers = undefined;
            return room;
        });
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.name, username: 'FakeUser', gameMode: 'mode classique' }),
        ).toBeUndefined();
    });

    it('canJoinGame should return undefined if the user is already in the potentialPlayer list', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            const newRoom = getFakeGameRoom();
            newRoom.userGame.potentialPlayers.push('FakeUser2');
            return newRoom;
        });
        expect(
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.name, username: 'FakeUser2', gameMode: 'mode classique' }),
        ).toBeUndefined();
    });

    it('canJoinGame should return the gameRoom if the game is joinable', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.name, username: 'FakeUser2', gameMode: 'mode classique' }),
        ).toEqual(newRoom);
    });

    it('joinGame should return true when socket has joined the game', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        socket.join.returns();
        expect(
            service.joinGame(socket, { gameName: newRoom.userGame.gameData.name, username: 'FakeUserJoining', gameMode: 'mode classique' }),
        ).toEqual(true);
        jest.spyOn(service, 'getGameRoom').mockRestore();
        expect(service.getGameRoom(newRoom.roomId).userGame.potentialPlayers).toContain('FakeUserJoining');
    });

    it('joinGame should return false if the gameName is undefined', () => {
        expect(service.joinGame(socket, { gameName: undefined, username: 'FakeUser', gameMode: 'solo' })).toEqual(false);
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

    it('isGameFinished should return false if the gameRoom doesnt exists', () => {
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
        newRoom.gameMode = 'time-limited';
        newRoom.userGame.timer = 0;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeTruthy();
    });

    it('isGameFinished should return false if timer is above 0 on time-limited', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = 'time-limited';
        newRoom.userGame.timer = 10;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeFalsy();
    });

    it('updateTimer should increment timer in mode classique', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(1);
    });

    it('updateTimer should decrement timer in mode classique', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = 'time-limited';
        newRoom.userGame.timer = 10;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(9);
    });

    it('updateTimer should decrement timer to 120 if above limit in time-limited mode', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = 'time-limited';
        newRoom.userGame.timer = 1000;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(120);
    });

    it('updateTimer should put timer at 0 if it is below 0 in time-limited mode', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = 'time-limited';
        newRoom.userGame.timer = -10;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(0);
    });

    it('getRoom should return room if the roomId is defined', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toEqual(newRoom);
    });

    it('getRoom should return room defined by the name and gamemode', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(undefined, newRoom.userGame.gameData.name, newRoom.gameMode)).toEqual(newRoom);
    });

    it('getRoom should return room defined by gamemode (time-limited)', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = 'time-limited';
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(undefined, undefined, newRoom.gameMode)).toEqual(newRoom);
    });

    it('getRoom should return undefined if the game doesnt exists', () => {
        // We need to cast to any because the map is private
        const newRoom = getFakeGameRoom();
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toEqual(undefined);
    });

    it('setRoom should add room', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.setGameRoom(newRoom);
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((testGameModeService as any).gameRooms.get(newRoom.roomId)).toEqual(newRoom);
    });

    it('getGameHistory should return gameHistory', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        expect(testGameModeService.getGameHistory(getFakeGameRoom().roomId)).toEqual(newGameHistory);
    });

    it('deleteGameHistory should delete gameHistory', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.deleteGameHistory(getFakeGameRoom().roomId);
        expect(testGameModeService.getGameRoom(getFakeGameRoom().roomId)).toEqual(undefined);
    });

    it('deleteRoom should delete room', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.deleteRoom(newRoom.roomId);
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toBeUndefined();
    });

    it('GameRoom should be of type GameRoom', () => {
        const newRoom = new GameRoom();
        expect(newRoom).toBeInstanceOf(GameRoom);
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

    it('nextGame should set the next gameRoom', () => {
        const newRoom = getFakeGameRoom();
        newRoom.gameMode = 'time-limited';
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

    it('saveGameHistory should correctly save game history with classic gamemode when only one username', () => {
        const fakeGameRoom = getFakeGameRoom();
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode classique Solo');
    });

    it('saveGameHistory should correctly save game history with classic gamemode when has two usernames', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.username2 = 'FakeUser2';
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode classique Multi-joueur');
    });

    it('saveGameHistory should correctly save game history with time-limited gamemode when only one username', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.gameMode = 'time-limited';
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode Temps Limité  Solo');
    });

    it('saveGameHistory should correctly save game history with time-limited gamemode when two usernames', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.username2 = 'FakeUser2';
        fakeGameRoom.gameMode = 'time-limited';
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode Temps Limité  Multi-joueur');
    });

    it('updateGameHistory should correctly update game history when user is the winner', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        const fakeEndGame: EndGame = {
            winner: true,
            roomId: getFakeGameRoom().roomId,
            username: getFakeGameHistory().username1,
            gameFinished: true,
        };
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.timer = 10;
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.addElementToMap(fakeGameRoom.roomId, fakeGameRoom);
        testGameModeService.updateGameHistory(fakeEndGame);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).winner).toEqual('FakeUser');
    });

    it('updateGameHistory should correctly update game history when game was abandonned', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        const fakeEndGame: EndGame = {
            winner: false,
            roomId: getFakeGameRoom().roomId,
            username: getFakeGameHistory().username1,
            gameFinished: false,
        };
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.timer = 10;
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.addElementToMap(fakeGameRoom.roomId, fakeGameRoom);
        testGameModeService.updateGameHistory(fakeEndGame);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).abandonned).toEqual('FakeUser');
    });

    it('updateGameHistory should correctly update game history with no winners if its a solo game', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameHistory = new Map();
        const newGameHistory = getFakeGameHistory();
        const fakeEndGame: EndGame = {
            winner: false,
            roomId: getFakeGameRoom().roomId,
            username: getFakeGameHistory().username1,
            gameFinished: true,
        };
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.timer = 10;
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        testGameModeService.addElementToMap(fakeGameRoom.roomId, fakeGameRoom);
        testGameModeService.updateGameHistory(fakeEndGame);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        // expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).winner).toEqual('Aucun gagnant');
    });

    it('abandonGameHistory should correctly update game history when game was abandonned', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameHistory = new Map();
        jest.spyOn(service, 'getGameHistory').mockImplementation(() => getFakeGameHistory());
        jest.spyOn(service, 'updateGameHistory').mockImplementation();
        const newGameHistory = getFakeGameHistory();
        testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
        service.abandonGameHistory(getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1);
        expect(service.updateGameHistory).toHaveBeenCalled();
    });

    it('abandonGameHistory should correctly update game history when game was abandonned and we are in a multiplayer lobby', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameHistory = new Map();
        jest.spyOn(service, 'getGameHistory').mockImplementation(() => {
            const gameHistory = getFakeGameHistory();
            gameHistory.username2 = 'FakeUser2';
            return gameHistory;
        });
        service.abandonGameHistory(getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1);
        jest.spyOn(service, 'getGameHistory').mockRestore();
        expect(service.getGameHistory(getFakeGameRoom().roomId).abandonned).toEqual('FakeUser');
    });

    it('applyTimeToTimer should correctly add time to userGame timer', () => {
        const fakeGameRoom = getFakeGameRoom();
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            return fakeGameRoom;
        });
        jest.spyOn(service, 'setGameRoom').mockImplementation(() => {
            return;
        });
        const time = 10;
        service.applyTimeToTimer(fakeGameRoom.roomId, time);
        expect(fakeGameRoom.userGame.timer).toEqual(time);
    });

    it('applyTimeToTimer should do nothing if gameRoom doesnt exists', () => {
        const fakeGameRoom = getFakeGameRoom();
        const setGameRoomSpy = jest.spyOn(service, 'setGameRoom').mockImplementation();
        const time = 10;
        service.applyTimeToTimer(fakeGameRoom.roomId, time);
        expect(setGameRoomSpy).not.toHaveBeenCalled();
    });

    it('getRoomsValues should return an array of game rooms', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getRoomsValues()).toEqual([newRoom]);
    });

    it('endGame should save game history and remove game room', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        const updateGameHistorySpy = jest.spyOn(testGameModeService, 'updateGameHistory').mockImplementation();
        const saveGameHistorySpy = jest.spyOn(gameHistoryService, 'saveGameHistory').mockImplementation();
        jest.spyOn(testGameModeService, 'getGameHistory').mockImplementation(() => getFakeGameHistory());
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

    // it('abandonLimitedTimeMode should change username if user 1 quit and update gameRoom and history', () => {
    //     // We need to cast to any because the map is private
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (testGameModeService as any).gameRooms = new Map();
    //     const newRoom = getFakeGameRoom();
    //     newRoom.userGame.username2 = 'FakeUser2';
    //     testGameModeService.addElementToMap(newRoom.roomId, newRoom);
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (testGameModeService as any).gameHistory = new Map();
    //     const newGameHistory = getFakeGameRoom();
    //     testGameModeService.addElementToMap(newGameHistory.roomId, newGameHistory);
    //     testGameModeService.abandonLimitedTimeMode(newRoom, newRoom.userGame.username1, socket.id);
    //     expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.username1).toEqual('FakeUser2');
    //     expect(testGameModeService.getGameHistory(newRoom.roomId)).toEqual(newGameHistory);
    // });
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
/* eslint-enable @typescript-eslint/no-magic-numbers */

const getFakeGameRoom = (): GameRoom => ({
    userGame: getFakeUserGame(),
    roomId: 'socketId',
    started: false,
    gameMode: 'mode classique',
});

const getFakeGameHistory = (): GameHistory => ({
    name: 'FakeGame',
    startTime: 0,
    timer: 0,
    username1: 'FakeUser',
    username2: '',
    gameMode: 'mode classique',
    abandonned: undefined,
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
