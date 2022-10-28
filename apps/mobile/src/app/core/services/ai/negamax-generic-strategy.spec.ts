import { TestBed } from '@angular/core/testing';
import { GameBoard } from "../../interfaces/gameBoard";
import { ScoringService } from "./scoring.service";
import { SimpleScoringService } from "../simple-scoring/simple-scoring.service";
import { NegamaxGenericStrategy } from "./negamax-generic-strategy";
import { IBoard } from "../../interfaces/IBoard";

const checkAll = true;

interface TestCase {
  turn?: number,
  blue: number[],
  red?: number[],
  check?: boolean,
}

describe('NegamaxGenericStrategy', () => {
  let gameBoard: GameBoard;
  let strategy: NegamaxGenericStrategy<IBoard>;
  const maps: TestCase[] = [
    {turn: 29, blue: [49], red: [], check: false},
    {turn: -1, blue: [2, 3, 4, 5, 6], red: [9, 10, 11, 12], check: false},
    {turn: -1, blue: [2, 3, 4, 5,], red: [9, 10, 11, 12, 13], check: false},
    {turn: -1, blue: [2, 3, 4, 5,], red: [100, 119, 138, 157, 176], check: false},
    {turn: -1, blue: [2, 3, 4, 5, 6], red: [100, 101, 119, 138, 157], check: false},
    {turn: 81, blue: [2, 3, 4, 5, 7], red: [100, 119, 138, 157], check: false},
    {turn: 76, blue: [2, 3, 4, 6], red: [0, 19, 38, 57,], check: false},
    {turn: 281, blue: [2, 3, 4, 6], red: [300, 319, 338, 357], check: false},
    {turn: 4, blue: [1, 2, 3], red: [], check: true},
    // {turn: -1, blue: [160, 142, 124, 178, 161], red: [180, 199, 106, 196],/* check: true, */},
    // {turn: -1, blue: [160, 142, 124, 178, 161], red: [180, 199, 106, 196],/* check: true, */},
    {turn: 235, blue: [196, 197, 198, 199, 203, 204, 205], red: [195, 200, 216, 236, 237, 238],/* check: true, */},
    {turn: 5, blue: [1, 2, 3, 4], red: [0]},
    {turn: 0, blue: [1, 2, 3, 4, 8], red: [5, 19, 20, 22]},
    {turn: 23, blue: [1, 2, 3, 4, 8], red: [19, 20, 21, 22,]},
  ];

  beforeEach(() => {
    gameBoard = {
      id: 1,
      timestamp: 1649655174300,
      player: {
        type: 0,
        map: [101],
        turn: [1],
        captured: 0,
        options: {
          color: () => '',
          deep: 1,
        },
      },
      enemy: {
        type: 1,
        map: [],
        turn: [],
        captured: 0,
        options: {
          color: () => '',
          deep: 1,
        },
      },
      size: 19,
      blocked: []
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ScoringService,
          useClass: SimpleScoringService
        }
      ]
    });
    strategy = TestBed.inject(NegamaxGenericStrategy);
  });

  it.each(maps)("$turn: $blue, $red", (t: TestCase) => {
    if (t.check || checkAll) {
      gameBoard.player.map = t.blue;
      gameBoard.enemy.map = t.red ?? [];
      expect(strategy.getNextTurn(gameBoard)).toEqual(t.turn);
    }
  });
});
