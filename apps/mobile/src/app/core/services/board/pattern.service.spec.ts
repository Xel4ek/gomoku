import { TestBed } from '@angular/core/testing';

import { PatternService } from './pattern.service';

describe('PatternService', () => {
  let service: PatternService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
