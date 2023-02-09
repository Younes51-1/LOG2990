import { DateService } from '@app/services/date/date.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClassicModeService } from './classic-mode.service';

describe('ClassicModeService', () => {
    let service: ClassicModeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ClassicModeService, DateService, Logger],
        }).compile();

        service = module.get<ClassicModeService>(ClassicModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
