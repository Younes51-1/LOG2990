import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClassicModeService } from './classic-mode.service';

describe('ClassicModeService', () => {
    let service: ClassicModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ClassicModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
