import { TestBed } from '@angular/core/testing';

import { SimpleAiService } from './simple-ai.service';

describe('SimpleAiService', () => {
  let service: SimpleAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
