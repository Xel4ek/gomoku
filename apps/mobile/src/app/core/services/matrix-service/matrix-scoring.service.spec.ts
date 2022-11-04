import { TestBed } from '@angular/core/testing';

import { MatrixScoringService } from './matrix-scoring.service';
import { BoardMatrix } from "../board/board-matrix";
import { GAMEBOARD } from "../../tools/constants";

describe('MatrixScoringService', () => {
  const gameBoard = GAMEBOARD;
  let service: MatrixScoringService;
  const maps: { score?: number, scoreRed?: number, scoreBlue: number, blue: number[], red?: number[], check?: boolean }[] = [
    { scoreBlue: 1000015, blue: [1, 2, 3, 5, 6] },
    { scoreBlue: 1000015, blue: [1, 2, 3, 4, 5], red: [0] },
    { scoreBlue: 1000015, blue: [21, 22, 23, 24, 25] },
    { scoreBlue: 1000015, blue: [51, 52, 53, 54, 55] },
    { scoreBlue: 1000012, blue: [51, 52, 53, 54,] },
    { scoreBlue: 6, blue: [1, 2, 3, 4], red: [0, 5] },
    { scoreBlue: 100000, blue: [20, 39, 58, 77, 99], red: [0, 5] },
    { scoreBlue: 0, blue: [2, 3, 4, 5], red: [6, 22, 24, 44] },
    { scoreBlue: 50009, blue: [51, 52, 53,], red: [1, 2, 3,] },
    { scoreBlue: 0, blue: [2, 3, 4, 1, 8], red: [22, 20, 5, 0, 19]},
    { scoreBlue: 100, blue: [1,2,3,4,8,9,10], red: [21,0,41,5,42,43,63], check: true },
    { scoreBlue: 100, blue: [1,2,3,4,8,9,10], red: [21,0,41,5,42,43,63], check: true },

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
    '$scoreBlue: $blue, $red',
    ({scoreBlue, blue, red}) => {
      gameBoard.player.map = blue;
      gameBoard.enemy.map = red ?? [];
      const matrixBoard = new BoardMatrix(gameBoard);
      service.evaluateBoardForWhite(matrixBoard, false);
      expect(matrixBoard.scoreBlue).toEqual(scoreBlue);
    }
  );

});
