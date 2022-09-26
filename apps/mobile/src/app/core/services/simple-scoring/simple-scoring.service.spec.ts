import { TestBed } from '@angular/core/testing';

import { SimpleScoringService } from './simple-scoring.service';

describe('SimpleScoringService', () => {
  let service: SimpleScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
