import { TestBed } from '@angular/core/testing';

import { AI, AiService, GameBoard } from './ai.service';
import { Board } from "../board";

describe('AiService', () => {
  let service: AiService;
  let board: Board;
  let gameBoard: GameBoard;

  beforeEach(() => {
    board = new Board(7);
    gameBoard = {
      id: 0,
      timestamp: Date.now(),
      player: 0n,
      opp: 0n,
    }
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
    expect(service.minimax(board, 1, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeDefined();
  });

  it('should return best Action', () => {
    board.generateRandomMoves(25);
    service.depth = 2;
    // service.getNextAction(board).subscribe(x => {
    //     const bestAction = of(...board.possibleActions)
    //       .pipe(max((a, b) => a.score < b.score ? -1 : 1))
    //     bestAction.subscribe(console.log);
    //     expect(x).toEqual(bestAction);
    //   }
    // );
  });

  it('should return board', () => {
    gameBoard.player = BigInt(
        "0b" +
        "0000000000" +
        "0000000100" +
        "0000000100" +
        "0001111100" +
        "0010000100" +
        "0010000100" +
        "0001111100" +
        "0000000000"
      );
    gameBoard.opp = BigInt(
      "0b" +
      "0000000000" +
      "0000000010" +
      "0000111110" +
      "0000000010" +
      "0001000010" +
      "0001000010" +
      "0000000010" +
      "0000111100"
    );
    console.log(gameBoard);
    service.postMessage(AI.SIMPLE, gameBoard);
    service.onMessage().subscribe(console.log);
  });
});
