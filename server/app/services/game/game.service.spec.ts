import { DateService } from '@app/services/date/date.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, DateService, Logger],
        }).compile();

        service = module.get<GameService>(GameService);
    });
});
