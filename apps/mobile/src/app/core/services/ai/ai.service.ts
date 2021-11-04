import { Injectable } from '@angular/core';
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
  player: string[],
  opp: string[],
  size: number,
  stat?: AiStatistics,
  lastMove: string,
  isPlayer: boolean,

}


@Injectable({
  providedIn: 'root'
})
export class AiService {
  depth = 3;
  winCount = 5;
  size = 19;

  getNextAction(board: BitBoard): string {
    this.minimax(board, this.depth, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    console.log(board.possibleActions);
    if (board.possibleActions.length > 0) {
      const action = board.possibleActions.reduce(((previousValue, currentValue) => {
        return previousValue.score > currentValue.score ? previousValue : currentValue;
      }));
      board.move(action.col, action.row);
      console.log(action);
      return (action.row * this.size + action.col).toString();
    }
    return "";
    // return Math.floor(Math.random() * board.size * board.size).toString();
  }

  minimax(board: BitBoard, depth: number, maximizing: boolean, alpha: number, beta: number): number {
    board.generateActions();
    console.log(board.possibleActions)
    if (depth === 0 || board.checkWin(maximizing) || board.possibleActions.length === 0) {
      console.log("WIN: " + board.checkWin(maximizing));
      return board.score;
    }
    if (maximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;
      for (const action of board.possibleActions) {
        // console.log(`${depth}: ${board.nextWhiteMove} ${action.row} - ${action.col}`);
        const board_new = board.clone();
        board_new.move(action.col, action.row);
        // action.score = this.minimax(board_new, depth - 1, !maximizing, alpha, beta);
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
        // action.score = this.minimax(board_new, depth - 1, !maximizing, alpha, beta);
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
