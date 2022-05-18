import {ScoringService} from "./scoring.service";
import {ActionService} from "./action.service";
import {BoardBits} from "../board/boardBits";
import {GameBoard} from "./ai.service";
import {BitBoardService} from "../board/bit-board.service";
import {Injectable, NgZone} from "@angular/core";
import {LoggerService} from "../logger/logger.service";
import {logger} from "@nrwl/tao/src/shared/logger";
import {Num} from "pts";
import {max} from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})

export class MinimaxStrategy {
  get dilation(): number {
    return this._dilation;
  }

  set dilation(value: number) {
    this._dilation = value;
  }

  get depth(): number {
    return this._depth;
  }

  set depth(value: number) {
    this._depth = value;
  }

  counter = 0;
  private _depth = 3;
  private _dilation = 1;

  constructor(
    private readonly scoringService: ScoringService,
    private readonly boardService: BitBoardService,
    private readonly actionService: ActionService,
    private readonly logger: LoggerService,
  ) {
  }

  getNextTurn(gameBoard: GameBoard): number {
    const board = this.boardService.createFromGameBoard(gameBoard);
    this.counter = 0;
    const start = performance.now();
    this.minimax(
      board,
      this.depth,
      true,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    this.logger.log("counter: " + this.counter + " by " + (performance.now() - start) / this.counter);
    this.logger.log("Total time minimax: " + (performance.now() - start));
    if (board.childBoards.length > 0) {
      const best = board.childBoards.reduce(
        ((previousValue, currentValue) => {
          return previousValue.score < currentValue.score ? previousValue : currentValue;
        })
      );
      const redMoveMask = best.red ^ board.red;
      console.log(board);
      this.logger.log("Total time getNextTurn: " + (performance.now() - start));
      return this.boardService.getFieldIndex(board.border, redMoveMask);
    }
    return -1;
  }

  minimax(
    board: BoardBits,
    depth: number,
    maximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    this.counter++;
    if (depth === 0) {
      return this.scoringService.calculate(board);
    }
    // TODO: stop of first win action
    this.boardService.generateBoards(board, this.dilation, maximizing ? 'red' : 'blue');
    if (board.childBoards.length === 0) {
      // TODO: replace with board score
      return this.scoringService.calculate(board);
    }
    if (maximizing) {
      let value = Number.NEGATIVE_INFINITY;
      for (const brd of board.childBoards) {
        brd.score = this.minimax(brd, depth - 1, !maximizing, alpha, beta);
        value = Math.max(value, brd.score);
        beta = Math.min(beta, value);
        if (value <= alpha) {
          break;
        }
      }
      return value;
    } else {
      let value = Number.POSITIVE_INFINITY;
      for (const brd of board.childBoards) {
        brd.score = this.minimax(brd, depth - 1, !maximizing, alpha, beta);
        value = Math.min(value, brd.score);
        alpha = Math.max(alpha, value);
        if (value >= beta) {
          break;
        }
      }
      return value;
    }
  }

  _minimax(
    board: BoardBits,
    depth: number,
    maximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    this.counter++;
    //console.debug("isMax: " + maximizing, board.possibleActions);
    //console.debug(BitBoard.printBitBoard(board.boards.player, board.size));
    if (depth === 0) {
      return this.scoringService.calculate(board);
      // console.log(
      //   'Depth 0. Score: ' + score,
      //   'WIN: ' + board.checkWin(maximizing),
      //   'Actions :' + board.possibleActions.length
      // );
      // console.debug(BitBoard.printBitBoard(board.boards.player, board.size));
      // console.debug(BitBoard.printBitBoard(board.boards.enemy, board.size));
    }
    // TODO: stop of first win action
    this.boardService.generateBoards(board, this.dilation, maximizing ? 'blue' : 'red');
    if (board.childBoards.length === 0) {
      // TODO: replace with board score
      return this.scoringService.calculate(board);
    }
    // this.logger.log("Child boards: " + board.childBoards.length);
    let bestScore = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    for (const brd of board.childBoards) {
      if (depth > 1) {
        // console.debug(`===${depth}: ${maximizing} ${action.row} - ${action.col}`);
      }
      brd.score = this.minimax(brd, depth - 1, !maximizing, alpha, beta);
      bestScore = maximizing
        ? Math.max(bestScore, brd.score)
        : Math.min(bestScore, brd.score);
      // console.debug(`${depth}: ${maximizing} ${action.row} - ${action.col}, score: ${action.score}`);
      //console.debug('max: ', oldMax, action.score, ' -> ', maxEval);
      if (maximizing)
        if (beta <= alpha) {
          // console.debug(`===${depth}: ${maximizing}, ${action.row} - ${action.col}, score: ${action.score}, alpha: ${alpha}, beta: ${beta}`);
          console.log(maximizing + ' pruned! ' + beta + '<=' + alpha);
          break;
        }
      if (maximizing) {
        alpha = Math.max(alpha, brd.score);
      } else {
        beta = Math.min(beta, brd.score);
      }
      // console.debug(`===${depth}: ${maximizing}, ${action.row} - ${action.col}, score: ${action.score}, alpha: ${alpha}, beta: ${beta}`);
    }
    // console.log(`${depth}:`, board.possibleActions);
    return bestScore;
  }

}
