import { TestBed } from '@angular/core/testing';

import { AiService } from './ai.service';
import { Board } from "../board";

describe('AiService', () => {
  let service: AiService;
  let board: Board;

  beforeEach(() => {
    board = new Board(19);
    TestBed.configureTestingModule({
    });
    service = TestBed.inject(AiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test', () => {
    expect(service).toBeDefined();
  });

  it('should minimax', () => {
    board.generateRandomMatrix();
    expect(service.minimax(board, 3, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 3)).toBeDefined();
  });
});
