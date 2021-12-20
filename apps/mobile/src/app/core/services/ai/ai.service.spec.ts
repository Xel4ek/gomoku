import { TestBed } from '@angular/core/testing';

import { AiService, GameBoard, Player } from './ai.service';
import { BitBoard } from "../board/bit-board";
import { BoardService } from "../board/board.service";
import mock = jest.mock;
import { Combination } from "../board/combination";

describe('AiService', () => {
  let service: AiService;
  let board: BitBoard;
  let size: number;
  const jestConsole = console;

  beforeEach(() => {
    global.console = require('console');
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiService);
    service.depth = 3;
    size = 19;
  });

  afterEach(() => {
    global.console = jestConsole;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test', () => {
    expect(service).toBeDefined();
  });

  it('should minimax', () => {
    expect(service.minimax(board, 1, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeDefined();
  });

  it('should return best Action', () => {
    board.generateRandomMoves(25);
    service.depth = 2;
  });

  it('should test mimimax', () => {
    const gb = {
      id: 5,

    } as GameBoard;
    const pl = {
      type: 0,
      // map: [5, 6, 7, 8],
      map: [5, 6, 7],
      turn: [1, 3],
      captured: 0,
      options: {
        deep: 1
      }
    } as Player;
    const enemy = {
      type: 1,
      map: [ 0 ],
      // map: [ 0, 1, 2, 3, ],
      turn: [2, 4, 6, 8,],
      captured: 0,
      options: {
        deep: 1
      }
    } as Player;
    const data = {
      id: 5,
      timestamp: 1639599954006,
      player: pl,
      enemy: enemy,
      size: 19,
      blocked: []
    } as GameBoard;
    const combos = new Combination(size);
    const board = new BitBoard(combos.combinations, undefined, data);
    const score = service.minimax(
      board,
      service.depth,
      false,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    console.log(board.possibleActions);
    expect(score).toBeGreaterThan(1000);

  });

});
