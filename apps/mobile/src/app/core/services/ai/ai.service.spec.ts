import { TestBed } from '@angular/core/testing';

import { AiService} from './ai.service';
import { BitBoard } from '../board/bit-board';
import { BoardService } from '../board/board.service';
import mock = jest.mock;
import { Combination } from '../board/combination';
import { Player } from '../../interfaces/player';
import { GameBoard } from "../../interfaces/gameBoard";

describe('AiService', () => {
  let service: AiService;
  let board: BitBoard;
  let size = 19;
  const combination = new Combination(size);
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

  it('should return best Action', () => {
    board.generateRandomMoves(25);
    service.depth = 2;
  });
});
