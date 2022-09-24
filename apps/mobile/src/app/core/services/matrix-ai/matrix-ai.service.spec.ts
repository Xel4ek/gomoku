import { TestBed } from '@angular/core/testing';

import { MatrixAIService } from './matrix-ai.service';

describe('MatrixAIService', () => {
  let service: MatrixAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatrixAIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
