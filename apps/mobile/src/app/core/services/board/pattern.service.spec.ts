import { TestBed } from '@angular/core/testing';

import { PatternService } from './pattern.service';
import { Board } from "./board";

describe('PatternService', () => {
  let service: PatternService;
  let board: Board;

  beforeEach(() => {
    board = new Board(19, BigInt("0b011111"), 0n, 1n)
    TestBed.configureTestingModule({
    });
    service = new PatternService(19);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find Pattern', () => {
    expect(service.findPatterns(board, "player").length).toBeGreaterThan(0);
  });
});
