import { ScoringService } from "./scoring.service";
import { ActionService } from "./action.service";
import { BoardBits } from "../board/boardBits";
import { GameBoard } from "./ai.service";
import { BitBoardService } from "../board/bit-board.service";
import { Injectable } from "@angular/core";

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

  private _depth = 3;
  private _dilation = 1;

  constructor(
    private readonly scoringService: ScoringService,
    private readonly boardService: BitBoardService,
    private readonly actionService: ActionService,
  ) {
  }

  getNextTurn(gameBoard: GameBoard): number {
    const board = this.boardService.createFromGameBoard(gameBoard);
    this.minimax(
      board,
      this.depth,
      false,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    if (board.possibleActions.length > 0) {
      const action = board.possibleActions.reduce(
        (previousValue, currentValue) => {
          return previousValue.score < currentValue.score
            ? previousValue
            : currentValue;
        }
      );
      this.boardService.moveByMask(board, action.mask, 'red');
      return this.boardService.getFieldIndex(board, action.mask);
    }
    return -1;
  }

  eval(
    isMax: boolean,
    board: BoardBits,
    depth: number,
    alpha: number,
    beta: number
  ) {
    let evalScore = isMax ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    for (const action of board.possibleActions) {
      if (depth > 1) {
        // console.debug(`===${depth}: ${isMax} ${action.row} - ${action.col}`);
      }
      const newBoard = board.clone();
      this.boardService.moveByMask(newBoard, action.mask, isMax ? 'blue' : 'red')
      action.score = this.minimax(newBoard, depth - 1, !isMax, alpha, beta);
      evalScore = isMax
        ? Math.max(evalScore, action.score)
        : Math.min(evalScore, action.score);
      // console.debug(`${depth}: ${isMax} ${action.row} - ${action.col}, score: ${action.score}`);
      //console.debug('max: ', oldMax, action.score, ' -> ', maxEval);
      if (isMax) {
        alpha = Math.max(alpha, action.score);
      } else {
        beta = Math.min(beta, action.score);
      }
      if (beta <= alpha) {
        // console.debug(`===${depth}: ${isMax}, ${action.row} - ${action.col}, score: ${action.score}, alpha: ${alpha}, beta: ${beta}`);
        console.log(isMax + ' pruned! ' + beta + '<=' + alpha);
        break;
      }
      // console.debug(`===${depth}: ${isMax}, ${action.row} - ${action.col}, score: ${action.score}, alpha: ${alpha}, beta: ${beta}`);
    }
    console.log(`${depth}:`, board.possibleActions);
    return evalScore;
  }

  minimax(
    board: BoardBits,
    depth: number,
    maximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    //console.debug("isMax: " + maximizing, board.possibleActions);
    //console.debug(BitBoard.printBitBoard(board.boards.player, board.size));
    if (depth === 0 || this.scoringService.calculate(board)) {
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
    board.possibleActions = this.boardService.generateActions(board, this.dilation);
    //   if (actions) {
    //     return this.eval(maximizing, board, depth, alpha, beta, actions);
    //   }
    if (board.possibleActions.length === 0) {
      // TODO: replace with board score
      return this.scoringService.calculate(board);
    }
    return this.eval(maximizing, board, depth, alpha, beta);
  }

}
