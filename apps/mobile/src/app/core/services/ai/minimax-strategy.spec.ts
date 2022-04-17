import { MinimaxStrategy } from './minimax-strategy';
import { GameBoard } from "./ai.service";
import { TestBed } from "@angular/core/testing";
import { BitBoardService } from "../board/bit-board.service";
import { ScoringService } from "./scoring.service";

describe('MinimaxStrategy', () => {
  let gameBoard: GameBoard;
  let strategy: MinimaxStrategy;
  const maps: { turn: number, blue: number[], red?: number[], check?: boolean }[] = [
    { turn: 0, blue: [1, 2, 3], red: [] },
    { turn: 5, blue: [1, 2, 3, 4], red: [0] },
    { turn: 0, blue: [2, 3, 4, 1, 8], red: [22, 20, 5, 0, 19] },
    { turn: 7, blue: [1, 2, 3, 4, 8, 9, 10], red: [0, 5, 21, 41, 42, 43], check: true },
  ];

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
      };
    TestBed.configureTestingModule({});
    strategy = TestBed.inject(MinimaxStrategy);
  });

  it.each(maps)(
    '$score: $blue, $red',
    ({ turn, red, blue, check }) => {
      gameBoard.player.map = blue;
      gameBoard.enemy.map = red ?? [];
      expect(strategy.getNextTurn(gameBoard)).toEqual(turn);
    }
  );

});
