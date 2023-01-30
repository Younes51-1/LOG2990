import { DateService } from '@app/services/date/date.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { Game, GameDocument } from '@app/model/database/game';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;

    beforeEach(async () => {
        gameModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<GameDocument>;
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, DateService, Logger, { provide: getModelToken(Game.name), useValue: gameModel }],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
