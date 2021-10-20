import { Injectable } from '@angular/core';
import { IBoard } from "../board";
import { ReplaySubject } from "rxjs";
import { BitBoard } from "../bit-board";

export enum AI {
  SIMPLE,
}

interface AiStatistics {
  [key: string]: unknown;
}

export interface GameBoard {
  id: number,
  timestamp: number,
  player: bigint,
  opp: bigint,
  stat?: AiStatistics,
}


@Injectable({
  providedIn: 'root'
})
export class AiService {
  depth = 3;
  private emitter = new ReplaySubject<GameBoard>();

  onMessage() {
    return this.emitter.asObservable();
  }

  postMessage(ai: AI, gameBoard: GameBoard) {
    const board = new BitBoard(10, gameBoard);
    this.getNextAction(board);
    gameBoard.id += 1;
    gameBoard.timestamp = Date.now();
    gameBoard.opp = board.boards.max.orig;
    this.emitter.next(gameBoard);
  }

  getNextAction(board: IBoard): IBoard {
    this.minimax(board, this.depth, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    const action = board.possibleActions.reduce(((previousValue, currentValue) => {
      return previousValue.score > currentValue.score ? previousValue : currentValue;
    }));
    board.move(action.col, action.row);
    return board;
  }

  minimax(board: IBoard, depth: number, maximizing: boolean, alpha: number, beta: number): number {
    board.generateActions();
    if (depth === 0 || board.win || board.possibleActions.length === 0) {
      return board.score;
    }
    if (maximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;
      for (const action of board.possibleActions) {
        // console.log(`${depth}: ${board.nextWhiteMove} ${action.row} - ${action.col}`);
        const board_new = board.clone();
        board_new.move(action.col, action.row);
        action.score = this.minimax(board_new, depth - 1, !maximizing, alpha, beta);
        const oldMax = maxEval;
        maxEval = Math.max(maxEval, action.score);
        // console.log('max: ', oldMax, action.score, ' -> ', maxEval);
        alpha = Math.max(alpha, action.score);
        if (beta <= alpha) {
          // console.log('max pruned!')
          break;
        }
      }
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;
      for (const action of board.possibleActions) {
        // console.log(`${depth}: ${board.nextWhiteMove} ${action.row} - ${action.col}`);
        const board_new = board.clone();
        board_new.move(action.col, action.row);
        action.score = this.minimax(board_new, depth - 1, !maximizing, alpha, beta);
        const oldMin = minEval;
        minEval = Math.min(minEval, action.score);
        // console.log('max: ', oldMin, action.score, ' -> ', minEval);
        beta = Math.min(beta, action.score);
        if (beta <= alpha) {
          // console.log('min pruned!')
          break;
        }
      }
      return minEval;
    }
  }

}
