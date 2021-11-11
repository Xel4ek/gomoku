import { TestBed } from '@angular/core/testing';

import { AiService, GameBoard } from './ai.service';
import { BitBoard } from "../board/bit-board";

describe('AiService', () => {
  let service: AiService;
  let board: BitBoard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test', () => {
    expect(service).toBeDefined();
  });

  it('should minimax', () => {
    expect(service.minimax(board, 1, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeDefined();
  });

  it('should return best Action', () => {
    board.generateRandomMoves(25);
    service.depth = 2;
  });

});
