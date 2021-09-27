import { TestBed } from '@angular/core/testing';

import { AiService } from './ai.service';
import { Board } from "../board";
import { max } from "rxjs/operators";
import { of } from "rxjs";
import { Action } from "../action";

describe('AiService', () => {
  let service: AiService;
  let board: Board;

  beforeEach(() => {
    board = new Board(7);
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
    board.generateRandomMatrix();
    expect(service.minimax(board, 1, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 3)).toBeDefined();
  });

  it('should return best Action', () => {
    board.generateRandomMoves(25);
    service.depth = 2;
    service.getNextAction(board).subscribe(x => {
        const bestAction = of(...board.possibleActions)
          .pipe(max((a, b) => a.score < b.score ? -1 : 1))
        bestAction.subscribe(console.log);
        expect(x).toEqual(bestAction);
      }
    );
  });
});
