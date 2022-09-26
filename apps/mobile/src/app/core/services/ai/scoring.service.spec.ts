import { TestBed } from '@angular/core/testing';

import { ScoringService } from './scoring.service';
import { BitBoardService } from "../board/bit-board.service";
import {BoardBits} from "../board/boardBits";
import { GameBoard } from "../../interfaces/gameBoard";

describe('ScoringService', () => {
  let service: ScoringService;
  let gameBoard: GameBoard;
  let bitBoardService: BitBoardService;
  const maps: { score: number, blue: number[], red?: number[], check?: boolean }[] = [
    { score: 100000, blue: [1, 2, 3, 4, 5] },
    { score: 100000, blue: [21, 22, 23, 24, 25] },
    { score: 100000, blue: [51, 52, 53, 54, 55] },
    { score: 100000, blue: [51, 52, 53, 54, 55], red: [1, 2, 3, 4, 5] },
    { score: 100000, blue: [51, 52, 53, 54,], red: [1, 2, 3, 4,] },
    { score: 15000, blue: [51, 52, 53, 54,] },
    { score: 15000, blue: [51, 52, 53, 54,] },
    { score: 15000, blue: [51, 52, 53, 54,] },
    { score: 100, blue: [51, 52, 53,], red: [1, 2, 3,] },
    { score: 0, blue: [2, 3, 4, 5], red: [6, 22, 24, 44] },
    { score: 0, blue: [2, 3, 4, 1, 8], red: [22, 20, 5, 0, 19]},
    { score: 100, blue: [1,2,3,4,8,9,10], red: [21,0,41,5,42,43,63], check: true },
    { score: 100, blue: [1,2,3,4,8,9,10], red: [21,0,41,5,42,43,63], check: true },

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
      gameBoard.enemy.map = red ?? [];
      const board = bitBoardService.createFromGameBoard(gameBoard);
      const calcScore = service.calculate(board);
      expect(calcScore).toEqual(score < 15000 ? score * service.maxScoreMultiple : score);
    }
  );

  it('should test problem Bitboard', function () {
    const board = new BoardBits(32n,
      2122853864401464060884233473564742902281977352394656099929366314873481496302855937491289314727348314831167040784614011378357048179695331087654445508449652218333279289344n,
      109836762715529940208659114270979683881108177037635771777132500367517985840995585972934236060860072527342960382522507825405428740833740282133848052173908213760n,
      179769313486231590772930519078902473361797697894230657273429857416722513549807456439521370524398016313747864138576501143761788526132752112794635304368249493456807085762422823135099751306398720293598418473628815745346865403688608154084369737106872856864305097429232224688701578133204645972143338320850776489983n
      )
    expect(service.calculate(board)).toEqual(600);
  });

  //TODO: некоторые поля (окруженные?) не попадают в оценку
  //TODO: низкая скорость при глубине 3, но не сильно растет качество решений => кеширование результатов
  //TODO: Поыему второй ход противника тупой? (не блокирует линию)
});
