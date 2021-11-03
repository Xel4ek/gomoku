import { Injectable } from '@angular/core';
import { IBoard } from "../board";
import { ReplaySubject } from "rxjs";
import { BitBoard, Combo } from "../bit-board";

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

  getNextAction(board: IBoard): string {
    this.minimax(board, this.depth, true, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    const action = board.possibleActions.reduce(((previousValue, currentValue) => {
      return previousValue.score > currentValue.score ? previousValue : currentValue;
    }));
    board.move(action.col, action.row);
    console.log(action);
    return (action.row * this.size + action.col).toString();
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

  private setMasks(combos: Combo[]) {
    combos.forEach(combo => {
      let maskP = combo.maskP;
      let maskO = combo.maskO;
      for (let row = 0; row < (this.size - combo.rows); row++) {
        for (let col = 0; col <= (this.size - combo.cols); col++) {
          combo.masksP.push(maskP);
          combo.masksO.push(maskO);
          maskP <<= 1n;
          maskO <<= 1n;
        }
        maskP <<= BigInt(combo.cols + 1);
        maskO <<= BigInt(combo.cols + 1);
      }
    });
  }
}
