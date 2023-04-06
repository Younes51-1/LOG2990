import { TestBed } from '@angular/core/testing';

import { PlayAreaService } from './play-area.service';

describe('PlayAreaService', () => {
  let service: PlayAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
