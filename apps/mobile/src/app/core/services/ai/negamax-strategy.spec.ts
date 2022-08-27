import {NegamaxStrategy} from './negamax-strategy';
import {GameBoard} from "./ai.service";
import {TestBed} from "@angular/core/testing";

describe('NegamaxStrategy', () => {
  let gameBoard: GameBoard;
  let strategy: NegamaxStrategy;
  const maps: { turn: number, blue: number[], red?: number[], check?: boolean }[] = [
    {turn: 0, blue: [1, 2, 3], red: []},
    {turn: 86, blue: [160, 142, 124, 178, 161], red: [180, 199, 106, 196], check: true},
    {turn: 197, blue: [160, 142, 124, 178, 161], red: [180, 199, 106, 196], check: true},
    {turn: 235, blue: [196, 197, 198, 199, 203, 204, 205], red: [195, 200, 216, 236, 237, 238], check: true},
    {turn: 5, blue: [1, 2, 3, 4], red: [0]},
    {turn: 0, blue: [1, 2, 3, 4, 8], red: [5, 19, 20, 22]},
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
    strategy = TestBed.inject(NegamaxStrategy);
  });

  it.each(maps)(
    '$score: $blue, $red',
    ({turn, red, blue, check}) => {
      if (check) {
        gameBoard.player.map = blue;
        gameBoard.enemy.map = red ?? [];
        expect(strategy.getNextTurn(gameBoard)).toEqual(turn);
      }
    }
  );

});
