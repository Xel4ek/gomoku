import { TestBed } from '@angular/core/testing';

import { MatrixScoringService } from './matrix-scoring.service';
import { BoardMatrix } from "../board/board-matrix";
import { GAMEBOARD } from "../../tools/constants";

describe('MatrixServiceService', () => {
  const gameBoard = GAMEBOARD;
  let service: MatrixScoringService;
  const maps: { score: number, blue: number[], red?: number[], check?: boolean }[] = [
    { score: 100000, blue: [1, 2, 3, 4, 5] },
    { score: 100015, blue: [21, 22, 23, 24, 25] },
    { score: 100015, blue: [51, 52, 53, 54, 55] },
    { score: 100015, blue: [51, 52, 53, 54, 55], red: [1, 2, 3, 4, 5] },
    { score: 100015, blue: [51, 52, 53, 54,], red: [1, 2, 3, 4,] },
    { score: 15000, blue: [51, 52, 53, 54,] },
    { score: 15000, blue: [51, 52, 53, 54,] },
    { score: 15000, blue: [51, 52, 53, 54,] },
    { score: 100, blue: [51, 52, 53,], red: [1, 2, 3,] },
    { score: 0, blue: [2, 3, 4, 5], red: [6, 22, 24, 44] },
    { score: 0, blue: [2, 3, 4, 1, 8], red: [22, 20, 5, 0, 19]},
    { score: 100, blue: [1,2,3,4,8,9,10], red: [21,0,41,5,42,43,63], check: true },
    { score: 100, blue: [1,2,3,4,8,9,10], red: [21,0,41,5,42,43,63], check: true },

  ];
  const board = new BoardMatrix(gameBoard);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatrixScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate score', function () {
    expect(service.evaluateBoardForWhite(board, false)).toEqual(10);
  });

  it.each(maps)(
    '$score: $blue, $red',
    ({score, red, blue}) => {
      gameBoard.player.map = blue;
      gameBoard.enemy.map = red ?? [];
      const matrixBoard = new BoardMatrix(gameBoard);
      const calcScore = service.getScore(matrixBoard, false, true);
      expect(calcScore).toEqual(score);
    }
  );

});
