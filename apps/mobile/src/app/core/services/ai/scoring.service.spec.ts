import { TestBed } from '@angular/core/testing';

import { ScoringService } from './scoring.service';
import { GameBoard } from "./ai.service";
import { BitBoardService } from "../board/bit-board.service";

describe('ScoringService', () => {
  let service: ScoringService;
  let gameBoard: GameBoard;
  let bitBoardService: BitBoardService;
  const maps: {score: number, blue: number[], red?: number[]}[] = [
    {score: 100000, blue: [1, 2, 3, 4, 5]},
    {score: 100000, blue: [21, 22, 23, 24, 25]},
    {score: 100000, blue: [51, 52, 53, 54, 55]},
    {score: 100000, blue: [51, 52, 53, 54, 55], red: [1, 2, 3, 4, 5]},
    {score: 100000, blue: [51, 52, 53, 54, ], red: [1, 2, 3, 4, ]},
    {score: 15000, blue: [51, 52, 53, 54, ]},
    {score: 15000, blue: [51, 52, 53, 54, ]},
    {score: 15000, blue: [51, 52, 53, 54, ]},
    {score: 100, blue: [51, 52, 53, ], red: [1, 2, 3, ]},
  ]

  beforeEach(() => {
    gameBoard =
      {
        "id": 1,
        "timestamp": 1649655174300,
        "player": {
          "type": 0,
          "map": [
            101
          ],
          "turn": [
            1
          ],
          "captured": 0,
          "options": {
            "color": () => "",
            "deep": 1
          }
        },
        "enemy": {
          "type": 1,
          "map": [],
          "turn": [],
          "captured": 0,
          "options": {
            "color": () => "",
            "deep": 1
          }
        },
        "size": 19,
        "blocked": []
      }
      TestBed.configureTestingModule({});
    bitBoardService = TestBed.inject(BitBoardService);
    service = TestBed.inject(ScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each(maps)(
    '$score: $blue, $red',
    ({score, red, blue}) => {
      gameBoard.player.map = blue;
      const board = bitBoardService.createFromGameBoard(gameBoard);
      expect(service.calculate(board)).toEqual(score * 1.1);
    }
  );

  it.each([
    {red: 1, b: 2, expected: 3},
    {red: 2, b: 5, expected: 7},
  ])(
    'add($expected, $b,)',
    ({red, b, expected}) => {
      expect(red+b).toEqual(expected);
    }
  )
});
