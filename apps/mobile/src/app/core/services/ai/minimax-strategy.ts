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
import {PatternService} from "../board/pattern.service";
import memoize from "../../tools/memoize";
import {BoardPrinterService} from "../board/board-printer.service";

@Injectable({
  providedIn: 'root',
})

//TODO: сделать поиск решений по битборду только на 5 клеток влево и вправо

export class MinimaxStrategy {
  private calculateBoardTime = 0;

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
  generateBoardTime = 0;
  private _depth = 3;
  private _dilation = 1;

  constructor(
    private readonly scoringService: ScoringService,
    private readonly boardService: BitBoardService,
    private readonly actionService: ActionService,
    private readonly logger: LoggerService,
    private readonly patternService: PatternService,
  ) {
  }

  getNextTurn(gameBoard: GameBoard): number {
    const board = this.boardService.createFromGameBoard(gameBoard);
    this.counter = 0;
    this.generateBoardTime = 0;
    const start = performance.now();
    this.patternService.counter = 0;
    this.minimax(
      board,
      this.depth,
      true,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    );
    const time = performance.now() - start;
    this.logger.log("Total time minimax: " + time);
    this.logger.log("counter: " + this.counter + " by " + time / this.counter);
    this.logger.log("Total time calculateBoard: " + this.calculateBoardTime + ", " + this.calculateBoardTime / time);
    this.logger.log("Total time generateBoard: " + this.generateBoardTime + ", " + this.generateBoardTime / time);
    this.logger.log("Total calls patternService: " + this.patternService.counter);
    const source = [];

    if (board.childBoards.length > 0) {
      const report: string[] = [];
      const size = 19;
      Array.from({length: gameBoard.size}).forEach((_, x) => {
        Array.from({length: gameBoard.size}).forEach((_, y) => {
          report.push(".....");
        })
        // report.push('\n');
      })
      board.childBoards.forEach(b => {
        const idx = this.boardService.getFieldIndex(b.border, b.red ^ board.red)
        b.indexScore[idx] = b.score;
        source.push(b.indexScore);
        report[idx] = (b.score / 1000).toFixed(1).padStart(5, ' ');
      })
      this.logger.log(
        Array.from({length: gameBoard.size}).reduce((acc: string[], cur) => {
          const str = report.splice(0, gameBoard.size).join('\t') + '\n\n';
          acc.push(str);
          return acc;
        }, []).join('')
      );
      console.log("Selected boards: " + BoardPrinterService.printBitBoardSelectedBoards(board));
      const redMoveMask = board.childBoards[board.selectedBoardIndex].red ^ board.red;
      console.log(board);
      this.logger.log("Total time getNextTurn: " + (performance.now() - start));
      return this.boardService.getFieldIndex(board.border, redMoveMask);
    }
    return -1;
  }

  //TODO: implement move ordering https://www.chessprogramming.org/Move_Ordering to speed up pruning
  //TODO: implement time constraint https://stackoverflow.com/questions/66493812/implementing-iterative-deepening-with-minimax-algorithm-with-alpha-beta-pruning
  // @memoize()
  minimax(
    board: BoardBits,
    depth: number,
    maximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    this.counter++;
    if (depth === 0) {
      const start = performance.now();
      const score = this.scoringService.calculate(board);
      this.calculateBoardTime += (performance.now() - start);
      return score;
    }
    // TODO: stop of first win action
    //TODO: Check player color for checkWin()
    const start = performance.now();
    this.boardService.generateBoards(board, this.dilation, maximizing ? 'red' : 'blue');
    this.generateBoardTime += (performance.now() - start);
    if (board.childBoards.length === 0) {
      // TODO: replace with board score
      const score = this.scoringService.calculate(board);
      console.log("ALARM:" + score);
      //TODO: Почему алгоритм считает небольшое количество очков по явно проигрышным ходам и не показывает напр. 99,1
      return score;
    }
    let best: number = maximizing ? -Infinity : Infinity

    for (const [idx, brd] of board.childBoards.entries()) {
      brd.score = this.minimax(brd, depth - 1, !maximizing, alpha, beta)

      if (maximizing) {
        if (brd.score > best) {
          best = brd.score
          board.selectedBoardIndex = idx;
        }
        if (brd.score >= beta) {
          break
        }
        if (brd.score > alpha) {
          alpha = brd.score
        }
      } else {
        if (brd.score < best) {
          best = brd.score
          board.selectedBoardIndex = idx;
        }
        if (brd.score <= alpha) {
          break
        }
        if (brd.score < beta) {
          beta = brd.score
        }
      }
    }
    return best;
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
