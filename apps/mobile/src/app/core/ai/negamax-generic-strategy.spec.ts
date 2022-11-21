import { TestBed } from '@angular/core/testing';
import { NegamaxGenericStrategy } from "./negamax-generic-strategy";
import { GameBoard } from "../interfaces/gameBoard";
import { IBoard } from "../interfaces/IBoard";
import { PlayerType } from "../interfaces/player";

const checkAll = true;

interface TestCase {
  turn?: number,
  blue: number[],
  red?: number[],
  check?: boolean,
}

interface TestGameBoard {
  move: number,
  gameBoard: GameBoard,
}

const gameBoards: GameBoard[] = [
  {
    "id": 11,
    "timestamp": 1668549043634,
    "player": {
      "type": PlayerType.HUMAN,
      "map": [
        199,
        217,
        235,
        219,
        162,
        179
      ],
      "turn": [
        1,
        3,
        5,
        7,
        9,
        11
      ],
      "captured": 0,
      "color": "rgba(3,0,187,",
      "options": {
        "deep": 1
      },
      "info": {
        "sequence": []
      }
    },
    "enemy": {
      "type": PlayerType.AI,
      "map": [
        253,
        180,
        181
      ],
      "turn": [
        6,
        8,
        10
      ],
      "captured": 1,
      "color": "rgba(194,6,6,",
      "options": {
        "deep": 3
      },
      "info": {
        "sequence": [
          {
            "turn": 2,
            "delta": 13.899999991059303,
            "count": 106,
            "capacity": 160
          },
          {
            "turn": 4,
            "delta": 52.29999999701977,
            "count": 638,
            "capacity": 1084
          },
          {
            "turn": 6,
            "delta": 139.70000000298023,
            "count": 1878,
            "capacity": 3514
          },
          {
            "turn": 8,
            "delta": 203.29999999701977,
            "count": 2804,
            "capacity": 5225
          },
          {
            "turn": 10,
            "delta": 292,
            "count": 4059,
            "capacity": 9157
          }
        ]
      }
    },
    "size": 19,
    "blocked": []
  },
  {
    "id": 23,
    "timestamp": 0,
    "player": {
      "type": PlayerType.AI,
      "map": [
        218,
        163,
        120,
        220,
        182,
        143,
        238,
        256
      ],
      "turn": [
        7,
        11,
        13,
        15,
        17,
        19,
        21,
        23
      ],
      "captured": 2,
      "color": "rgba(3,0,187,",
      "options": {
        "deep": 3
      },
      "info": {
        "sequence": [
          {
            "turn": 1,
            "delta": 0,
            "count": 0,
            "capacity": 0
          },
          {
            "turn": 3,
            "delta": 17.599999994039536,
            "count": 292,
            "capacity": 460
          },
          {
            "turn": 5,
            "delta": 49.79999999701977,
            "count": 854,
            "capacity": 1544
          },
          {
            "turn": 7,
            "delta": 97.59999999403954,
            "count": 1763,
            "capacity": 3744
          },
          {
            "turn": 9,
            "delta": 160.90000000596046,
            "count": 2826,
            "capacity": 7157
          },
          {
            "turn": 11,
            "delta": 127.20000000298023,
            "count": 2244,
            "capacity": 4466
          },
          {
            "turn": 13,
            "delta": 277.40000000596046,
            "count": 4709,
            "capacity": 11104
          },
          {
            "turn": 15,
            "delta": 465.80000001192093,
            "count": 8184,
            "capacity": 14491
          },
          {
            "turn": 17,
            "delta": 462,
            "count": 8017,
            "capacity": 24091
          },
          {
            "turn": 19,
            "delta": 345.79999999701977,
            "count": 6020,
            "capacity": 17751
          },
          {
            "turn": 21,
            "delta": 371.20000000298023,
            "count": 6433,
            "capacity": 18915
          },
          {
            "turn": 23,
            "delta": 654.2999999970198,
            "count": 11310,
            "capacity": 25088
          }
        ]
      }
    },
    "enemy": {
      "type": PlayerType.AI,
      "map": [
        161,
        200,
        140,
        160,
        162,
        216,
        180,
        219,
        201,
        123,
        198
      ],
      "turn": [
        2,
        4,
        6,
        8,
        10,
        12,
        14,
        16,
        18,
        20,
        22
      ],
      "captured": 0,
      "color": "rgba(194,6,6,",
      "options": {
        "deep": 3
      },
      "info": {
        "sequence": [
          {
            "turn": 2,
            "delta": 12.600000008940697,
            "count": 131,
            "capacity": 202
          },
          {
            "turn": 4,
            "delta": 25.700000002980232,
            "count": 425,
            "capacity": 754
          },
          {
            "turn": 6,
            "delta": 81.80000001192093,
            "count": 1360,
            "capacity": 3364
          },
          {
            "turn": 8,
            "delta": 181.90000000596046,
            "count": 3231,
            "capacity": 6268
          },
          {
            "turn": 10,
            "delta": 103.90000000596046,
            "count": 1874,
            "capacity": 3458
          },
          {
            "turn": 12,
            "delta": 203.20000000298023,
            "count": 3576,
            "capacity": 7054
          },
          {
            "turn": 14,
            "delta": 336.90000000596046,
            "count": 5941,
            "capacity": 10340
          },
          {
            "turn": 16,
            "delta": 481.59999999403954,
            "count": 8416,
            "capacity": 14944
          },
          {
            "turn": 18,
            "delta": 479.40000000596046,
            "count": 8357,
            "capacity": 18500
          },
          {
            "turn": 20,
            "delta": 555.7999999970198,
            "count": 9649,
            "capacity": 19044
          },
          {
            "turn": 22,
            "delta": 331.29999999701977,
            "count": 5705,
            "capacity": 12640
          }
        ]
      }
    },
    "size": 19,
    "blocked": []
  },
  {
    "id": 11,
    "timestamp": 1668958269795,
    "player": {
      "type": PlayerType.HUMAN,
      "map": [
        20,
        107,
        291,
        241,
        217,
        166
      ],
      "turn": [
        1,
        3,
        5,
        7,
        9,
        11
      ],
      "captured": 0,
      "color": "rgba(3,0,187,",
      "options": {
        "deep": 1
      },
      "info": {
        "sequence": []
      }
    },
    "enemy": {
      "type": PlayerType.AI,
      "map": [
        40,
        39,
        21,
        41,
        61
      ],
      "turn": [
        2,
        4,
        6,
        8,
        10
      ],
      "captured": 0,
      "color": "rgba(194,6,6,",
      "options": {
        "deep": 3
      },
      "info": {
        "sequence": [
          {
            "turn": 2,
            "delta": 28,
            "count": 140,
            "capacity": 208
          },
          {
            "turn": 4,
            "delta": 85.20000000298023,
            "count": 1269,
            "capacity": 2470
          },
          {
            "turn": 6,
            "delta": 193.20000000298023,
            "count": 3155,
            "capacity": 5932
          },
          {
            "turn": 8,
            "delta": 248.09999999403954,
            "count": 4245,
            "capacity": 7858
          },
          {
            "turn": 10,
            "delta": 644.7999999970198,
            "count": 11325,
            "capacity": 21210
          }
        ]
      }
    },
    "size": 19,
    "blocked": []
  }
];

const testGameBoards: TestGameBoard[] = [
  // {move: 159, gameBoard: gameBoards[0]},
  // {move: 100, gameBoard: gameBoards[1]},
  {move: 61, gameBoard: gameBoards[2]},
]

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
    TestBed.configureTestingModule({
      providers: [
        NegamaxGenericStrategy
      ]
    });
    strategy = TestBed.inject(NegamaxGenericStrategy);
  });

  it.skip.each(maps)("$turn: $blue, $red", (t: TestCase) => {
    if (t.check || checkAll) {
      gameBoard.player.map = t.blue;
      gameBoard.enemy.map = t.red ?? [];
      expect(strategy.getNextTurn(gameBoard).turn).toEqual(t.turn);
    }
  });

  it('should test specific gameBoard', function () {
    gameBoard = {
      "id": 23,
      "timestamp": 0,
      "player": {
        "type": PlayerType.AI,
        "map": [
          218,
          163,
          120,
          220,
          182,
          143,
          238,
          256
        ],
        "turn": [
          7,
          11,
          13,
          15,
          17,
          19,
          21,
          23
        ],
        "captured": 2,
        "color": "rgba(3,0,187,",
        "options": {
          "deep": 3
        },
        "info": {
          "sequence": [
            {
              "turn": 1,
              "delta": 0,
              "count": 0,
              "capacity": 0
            },
            {
              "turn": 3,
              "delta": 17.599999994039536,
              "count": 292,
              "capacity": 460
            },
            {
              "turn": 5,
              "delta": 49.79999999701977,
              "count": 854,
              "capacity": 1544
            },
            {
              "turn": 7,
              "delta": 97.59999999403954,
              "count": 1763,
              "capacity": 3744
            },
            {
              "turn": 9,
              "delta": 160.90000000596046,
              "count": 2826,
              "capacity": 7157
            },
            {
              "turn": 11,
              "delta": 127.20000000298023,
              "count": 2244,
              "capacity": 4466
            },
            {
              "turn": 13,
              "delta": 277.40000000596046,
              "count": 4709,
              "capacity": 11104
            },
            {
              "turn": 15,
              "delta": 465.80000001192093,
              "count": 8184,
              "capacity": 14491
            },
            {
              "turn": 17,
              "delta": 462,
              "count": 8017,
              "capacity": 24091
            },
            {
              "turn": 19,
              "delta": 345.79999999701977,
              "count": 6020,
              "capacity": 17751
            },
            {
              "turn": 21,
              "delta": 371.20000000298023,
              "count": 6433,
              "capacity": 18915
            },
            {
              "turn": 23,
              "delta": 654.2999999970198,
              "count": 11310,
              "capacity": 25088
            }
          ]
        }
      },
      "enemy": {
        "type": PlayerType.AI,
        "map": [
          161,
          200,
          140,
          160,
          162,
          216,
          180,
          219,
          201,
          123,
          198
        ],
        "turn": [
          2,
          4,
          6,
          8,
          10,
          12,
          14,
          16,
          18,
          20,
          22
        ],
        "captured": 0,
        "color": "rgba(194,6,6,",
        "options": {
          "deep": 3
        },
        "info": {
          "sequence": [
            {
              "turn": 2,
              "delta": 12.600000008940697,
              "count": 131,
              "capacity": 202
            },
            {
              "turn": 4,
              "delta": 25.700000002980232,
              "count": 425,
              "capacity": 754
            },
            {
              "turn": 6,
              "delta": 81.80000001192093,
              "count": 1360,
              "capacity": 3364
            },
            {
              "turn": 8,
              "delta": 181.90000000596046,
              "count": 3231,
              "capacity": 6268
            },
            {
              "turn": 10,
              "delta": 103.90000000596046,
              "count": 1874,
              "capacity": 3458
            },
            {
              "turn": 12,
              "delta": 203.20000000298023,
              "count": 3576,
              "capacity": 7054
            },
            {
              "turn": 14,
              "delta": 336.90000000596046,
              "count": 5941,
              "capacity": 10340
            },
            {
              "turn": 16,
              "delta": 481.59999999403954,
              "count": 8416,
              "capacity": 14944
            },
            {
              "turn": 18,
              "delta": 479.40000000596046,
              "count": 8357,
              "capacity": 18500
            },
            {
              "turn": 20,
              "delta": 555.7999999970198,
              "count": 9649,
              "capacity": 19044
            },
            {
              "turn": 22,
              "delta": 331.29999999701977,
              "count": 5705,
              "capacity": 12640
            }
          ]
        }
      },
      "size": 19,
      "blocked": []
    }
    const a = strategy.getNextTurn(gameBoard);
    expect(a.turn).toEqual(256);
  });

  it.each(testGameBoards)("$move: testGameBoards", (t: TestGameBoard) => {
    expect(strategy.getNextTurn(t.gameBoard).turn).toEqual(t.move);
  })

});
