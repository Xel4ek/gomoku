import { Injectable } from '@angular/core';
import { BitBoard } from "../board/bit-board";

export enum AI {
  SIMPLE,
}

//TODO: Check score calculation (may be wrong shift to N, NW, NE)
//TODO: AI ignores first move
//TODO: place AI to worker

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
    this.minimax(board, this.depth, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    console.log(board.possibleActions);
    if (board.possibleActions.length > 0) {
      const action = board.possibleActions.reduce(((previousValue, currentValue) => {
        return previousValue.score < currentValue.score ? previousValue : currentValue;
      }));
      //TODO: refactor turn
      board.move(action.col, action.row, "enemy");
      console.log(action);
      return (action.row * this.size + action.col).toString();
    }
    return "";
    // return Math.floor(Math.random() * board.size * board.size).toString();
  }

  eval(isMax: boolean, board: BitBoard, depth: number, alpha: number, beta: number) {
      let evalScore = isMax ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
      for (const action of board.possibleActions) {
        // console.log(`${depth}: ${board.nextWhiteMove} ${action.row} - ${action.col}`);
        const board_new = board.clone();
        board_new.move(action.col, action.row, "player");
        action.score = this.minimax(board_new, depth - 1, !isMax, alpha, beta);
        evalScore = isMax ? Math.max(evalScore, action.score) : Math.min(evalScore, action.score);
        // console.log('max: ', oldMax, action.score, ' -> ', maxEval);
        if (isMax) {
          alpha = Math.max(alpha, action.score);
        } else {
          beta = Math.min(beta, action.score);
        }
        if (beta <= alpha) {
          // console.log('max pruned!')
          break;
        }
      }
      return evalScore;
  }


  minimax(board: BitBoard, depth: number, maximizing: boolean, alpha: number, beta: number): number {
    board.generateActions();
    console.log(board.possibleActions);
    if (depth === 0 || board.checkWin(maximizing) || board.possibleActions.length === 0) {
      console.log("WIN: " + board.checkWin(maximizing));
      return board.updateScore();
    }
    return this.eval(maximizing, board, depth, alpha, beta);
  }

}
