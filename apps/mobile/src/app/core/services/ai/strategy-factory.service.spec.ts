import { TestBed } from '@angular/core/testing';

import { StrategyFactoryService } from './strategy-factory.service';

describe('StrategyFactoryService', () => {
  let service: StrategyFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrategyFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
