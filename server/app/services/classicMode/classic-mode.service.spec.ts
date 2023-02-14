import { environment } from '@app/environments/environment.prod';
import { BestTime } from '@app/model/schema/best-times.schema';
import { GameRoom } from '@app/model/schema/game-room.schema';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { ClassicModeService } from './classic-mode.service';

class TestClassicModeService extends ClassicModeService {
    addElementToMap(key: string, value: GameRoom) {
        this.gameRooms.set(key, value);
    }
}

describe('ClassicModeService', () => {
    let service: ClassicModeService;
    let testClassicModeService: TestClassicModeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ClassicModeService,
                    useClass: TestClassicModeService,
                },
                TestClassicModeService,
            ],
        }).compile();

        service = module.get<ClassicModeService>(ClassicModeService);
        testClassicModeService = module.get<TestClassicModeService>(TestClassicModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('initRoom should create a new room with the given id', () => {
    //     const socketId = 'my-custom-id';
    //     const namespace = server.sockets;
    //     const socket = namespace.connected[socketId] || namespace.connect(null, { query: { id: socketId } });

    //     const roomId = 'FakeRoomId';
    //     service.initNewRoom({ socket, id } as Socket, getFakeUserGame());
    //     expect(service.gameRooms[roomId]).toBeDefined();
    // });

    it('isGameFinished should return true if all differences have been found', () => {
        const newRoom = getFakeGameRoom();
        testClassicModeService.addElementToMap(newRoom.roomId, newRoom);
        testClassicModeService.gameRooms.get(newRoom.roomId).userGame.nbDifferenceFound = 2;
        expect(testClassicModeService.isGameFinished(newRoom.roomId)).toBeTruthy();
    });

    it('isGameFinished should return false if not all differences have been found', () => {
        const newRoom = getFakeGameRoom();
        testClassicModeService.addElementToMap(newRoom.roomId, newRoom);
        testClassicModeService.gameRooms.get(newRoom.roomId).userGame.nbDifferenceFound = 1;
        expect(testClassicModeService.isGameFinished(newRoom.roomId)).toBeFalsy();
    });

    it('validateDifference should return true if difference is valid', () => {
        const newRoom = getFakeGameRoom();
        const position = new Vector2D();
        position.x = 1;
        position.y = 1;
        testClassicModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testClassicModeService.validateDifference(newRoom.roomId, position)).toBeTruthy();
    });

    it('validateDifference should return false if difference is not valid', () => {
        const newRoom = getFakeGameRoom();
        testClassicModeService.addElementToMap(newRoom.roomId, newRoom);
        expect(testClassicModeService.validateDifference(newRoom.roomId, { x: 0, y: 0 })).toBeFalsy();
    });

    it('updateTimer should increment timer', () => {
        const newRoom = getFakeGameRoom();
        testClassicModeService.addElementToMap(newRoom.roomId, newRoom);
        testClassicModeService.updateTimer(newRoom);
        expect(testClassicModeService.gameRooms.get(newRoom.roomId).userGame.timer).toEqual(1);
    });

    it('deleteRoom should delete room', () => {
        testClassicModeService.gameRooms = new Map();
        const newRoom = getFakeGameRoom();
        testClassicModeService.addElementToMap(newRoom.roomId, newRoom);
        testClassicModeService.deleteRoom(newRoom.roomId);
        expect(testClassicModeService.gameRooms.get(newRoom.roomId)).toBeUndefined();
    });
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

const getFakeGameRoom = (): GameRoom => ({
    userGame: getFakeUserGame(),
    roomId: 'socketid',
});
