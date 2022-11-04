import { TestBed } from '@angular/core/testing';

import { BitBoardService } from "../board/bit-board.service";
import { SimpleScoringService } from "./simple-scoring.service";
import { GameBoard } from "../../interfaces/gameBoard";
import { Color } from "../../color";

const all: boolean = false;

interface TestCase {
  score: number,
  blue: number[],
  red?: number[],
  side?: Color,
  turn?: Color,
  check?: boolean,
}

const maps: TestCase[] = [
  {score: 1, blue: [45], red: [], side: "red", turn: "red", check: false},
  {score: 1/1000011, blue: [11], red: [1, 2, 3, 4, 5], side: "red", turn: "red", check: false},
  {score: 1/1000000, blue: [11], red: [1, 2, 3, 4, 5], side: "blue", turn: "red"},
  {score: 1000000, blue: [21, 22, 23, 24, 25]},
  {score: 1000000, blue: [51, 52, 53, 54, 55]},
  {score: 1000000, blue: [51, 52, 53, 54, 55], red: [1, 2, 3, 4, 5]},
  {score: 1000000, blue: [51, 52, 53, 54,], red: [1, 2, 3, 4,]},
  {score: 150000, blue: [51, 52, 53, 54,]},
  {score: 150000, blue: [51, 52, 53, 54,]},
  {score: 150000, blue: [51, 52, 53, 54,]},
  {score: 1000, blue: [51, 52, 53,], red: [1, 2, 3,]},
  {score: 0, blue: [2, 3, 4, 5], red: [1, 6]},
  {score: 0, blue: [2, 3, 4, 1, 8], red: [22, 20, 5, 0, 19]},
  {score: 100, blue: [1, 2, 3, 4, 8, 9, 10], red: [21, 0, 41, 5, 42, 43, 63], check: false},
  {score: 100, blue: [1, 2, 3, 4, 8, 9, 10], red: [21, 0, 41, 5, 42, 43, 63], check: true},
  {score: 4, blue: [2, 3, 4, 5, 6], red: [100, 101, 119, 138, 157], check: true},
];

const getScoreMaps: TestCase[] = [
  {score: 3, blue: [0], check: false},
  {score: 4, blue: [1], check: false},
  {score: 4, blue: [45], check: false},
  {score: 8, blue: [0, 1], check: false},
  {score: 10, blue: [1, 2], check: false},
  {score: 12, blue: [1, 2], turn: "blue", check: false},
  {score: 11, blue: [45, 46], check: false},
  {score: 13, blue: [45, 46], turn: "blue", check: false},
  {score: 209, blue: [45, 46, 47], check: false},
  {score: 250012, blue: [45, 46, 47, 48], check: false},
  {score: 1000015, blue: [45, 46, 47, 48, 49], check: false},
  {score: 250022, blue: [2, 3, 4, 5, 6], red: [100, 101, 119, 138, 157], side: "red", turn: "blue", check: true},
  {score: 1000011, blue: [2, 3, 4, 5, 6], red: [100, 101, 119, 138, 157], side: "blue", turn: "blue", check: true},
]

describe('SimpleScoringService', () => {
  let service: SimpleScoringService;
  let gameBoard: GameBoard;
  let bitBoardService: BitBoardService;

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
    bitBoardService = TestBed.inject(BitBoardService);
    service = TestBed.inject(SimpleScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each(maps)(
    '$score: $blue, $red',
    (t) => {
      if (t.check || all) {
        gameBoard.player.map = t.blue;
        gameBoard.enemy.map = t.red ?? [];
        const board = bitBoardService.createFromGameBoard(gameBoard);
        const calcScore = service.evaluateBoard(board, t.turn ?? "red");
        expect(calcScore).toBeGreaterThanOrEqual(t.score);
      }
    }
  );

  it.each(getScoreMaps)(
    'getScore(): $score, $blue, $turn',
    (t) => {
      if (t.check || all) {
        gameBoard.player.map = t.blue;
        gameBoard.enemy.map = t.red ?? [];
        const board = bitBoardService.createFromGameBoard(gameBoard);
        const score = service.getScore(board, t.side ?? "blue", t.turn ?? "red");
        expect(score).toEqual(t.score);
      }
    }
  );

  // it('should test problem Bitboard', function () {
  //   const board = new BoardBits(32n,
  //     2122853864401464060884233473564742902281977352394656099929366314873481496302855937491289314727348314831167040784614011378357048179695331087654445508449652218333279289344n,
  //     109836762715529940208659114270979683881108177037635771777132500367517985840995585972934236060860072527342960382522507825405428740833740282133848052173908213760n,
  //     179769313486231590772930519078902473361797697894230657273429857416722513549807456439521370524398016313747864138576501143761788526132752112794635304368249493456807085762422823135099751306398720293598418473628815745346865403688608154084369737106872856864305097429232224688701578133204645972143338320850776489983n
  //   )
  //   expect(service.getScore(board, "red", "red")).toEqual(600);
  // });
  //
  //TODO: некоторые поля (окруженные?) не попадают в оценку
  //TODO: низкая скорость при глубине 3, но не сильно растет качество решений => кеширование результатов
  //TODO: Поыему второй ход противника тупой? (не блокирует линию)
});
