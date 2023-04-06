/* eslint-disable max-lines */
import { environment } from '@app/environments/environment.prod';
import { GameHistory } from '@app/model/database/game-history';
import { BestTime } from '@app/model/schema/best-times.schema';
import { EndGame } from '@app/model/schema/end-game.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
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

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket, 'id', { value: getFakeGameRoom().roomId, writable: true });
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: GameModeService,
                    useClass: TestGameModeService,
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
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.gameForm.name, username: 'FakeUser', gameMode: 'solo' }),
        ).toBeUndefined();
    });

    it('canJoinGame should return undefined if the player is already the one waiting', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        expect(
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.gameForm.name, username: 'FakeUser', gameMode: 'solo' }),
        ).toBeUndefined();
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
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.gameForm.name, username: 'FakeUser', gameMode: 'solo' }),
        ).toBeUndefined();
    });

    it('canJoinGame should return undefined if the user is already in the potentialPlayer list', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            const newRoom = getFakeGameRoom();
            newRoom.userGame.potentialPlayers.push('FakeUser2');
            return newRoom;
        });
        expect(
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.gameForm.name, username: 'FakeUser', gameMode: 'solo' }),
        ).toBeUndefined();
    });

    it('canJoinGame should return the gameRoom if the game is joinable', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(
            service.canJoinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.gameForm.name, username: 'FakeUser', gameMode: 'solo' }),
        ).toEqual(newRoom);
    });

    it('joinGame should return false if the gameName is undefined', () => {
        expect(service.joinGame(socket, { gameName: undefined, username: 'FakeUser', gameMode: 'solo' })).toEqual(false);
    });

    it('joinGame should add the player to the potentialPlayer list and return true if succeeded', () => {
        jest.spyOn(service, 'getGameRoom').mockImplementation(() => {
            return getFakeGameRoom();
        });
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(
            service.joinGame(socket, { gameName: getFakeGameRoom().userGame.gameData.gameForm.name, username: 'FakeUser', gameMode: 'solo' }),
        ).toEqual(true);
        expect(service.getGameRoom(newRoom.roomId).userGame.potentialPlayers).toContain('FakeUser2');
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

    it('isGameFinished should return true if all differences have been found', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.getGameRoom(newRoom.roomId).userGame.nbDifferenceFound = 2;
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeTruthy();
    });

    it('isGameFinished should return false if not all differences have been found', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.getGameRoom(newRoom.roomId).userGame.nbDifferenceFound = 1;
        expect(testGameModeService.isGameFinished(newRoom.roomId)).toBeFalsy();
    });

    it('updateTimer should increment timer', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        testGameModeService.updateTimer(newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId).userGame.timer).toEqual(1);
    });

    it('getRoom should return room', () => {
        // We need to cast to any because the map is private
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (testGameModeService as any).gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(newRoom.roomId)).toEqual(newRoom);
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

    it('getGameRoom should return the gameRoom', () => {
        const newRoom = getFakeGameRoom();
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(newRoom.userGame.gameData.gameForm.name)).toEqual(newRoom);
    });

    it('getGameRoom should not return the gameRoom if started is true', () => {
        const newRoom = getFakeGameRoom();
        newRoom.started = true;
        testGameModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testGameModeService.getGameRoom(newRoom.userGame.gameData.gameForm.name)).toEqual(undefined);
    });

    it('getGameRoom should not return undefined if no game is found', () => {
        expect(testGameModeService.getGameRoom('notaRealGame')).toEqual(undefined);
    });

    it('saveGameHistory should correctly save game history with solo gamemode when only one username', () => {
        const fakeGameRoom = getFakeGameRoom();
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.gameForm.name);
        expect(service.getGameHistory(fakeGameRoom.roomId).gameMode).toEqual('Mode Temps Limité  Solo');
    });

    it('saveGameHistory should correctly save game history with solo gamemode when only one username', () => {
        const fakeGameRoom = getFakeGameRoom();
        fakeGameRoom.userGame.username2 = 'FakeUser2';
        service.saveGameHistory(fakeGameRoom);
        expect(service.getGameHistory(fakeGameRoom.roomId).name).toEqual(fakeGameRoom.userGame.gameData.gameForm.name);
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
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
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
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
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
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).timer).toEqual(10);
        expect(testGameModeService.getGameHistory(fakeGameRoom.roomId).winner).toEqual('Aucun gagnant');
    });

    // it('abandonGameHistory should correctly update game history when game was abandonned', () => {
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (testGameModeService as any).gameHistory = new Map();
    //     jest.spyOn(service, 'updateGameHistory').mockImplementation();
    //     const newGameHistory = getFakeGameHistory();
    //     testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
    //     service.abandonGameHistory(getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1);
    //     expect(service.updateGameHistory).toHaveBeenCalled();
    // });

    // it('abandonGameHistory should correctly update game history when game was abandonned and we are in a multiplayer lobby', () => {
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (testGameModeService as any).gameHistory = new Map();
    //     const newGameHistory = getFakeGameHistory();
    //     newGameHistory.username2 = 'FakeUser2';
    //     testGameModeService.addElementToHistoryMap(getFakeGameRoom().roomId, newGameHistory);
    //     service.abandonGameHistory(getFakeGameRoom().roomId, getFakeGameRoom().userGame.username1);
    //     expect(service.getGameHistory(getFakeGameRoom().roomId).abandonned).toEqual('FakeUser');
    // });

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
    userGame: getFakeUserGame(),
    roomId: 'socketId',
    started: false,
    gameMode: 'Mode classique Solo',
});

const getFakeGameHistory = (): GameHistory => ({
    name: 'FakeGame',
    startTime: 0,
    timer: 0,
    username1: 'FakeUser',
    username2: '',
    gameMode: 'Mode classique Solo',
    abandonned: undefined,
    winner: undefined,
});
