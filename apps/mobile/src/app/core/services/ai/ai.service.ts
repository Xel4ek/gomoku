import { Injectable } from '@angular/core';
import { Board } from "../board";
import { Action } from "../action";
import { max } from "rxjs/operators";
import { of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AiService {
  depth = 3;
  offset = 3;

  getNextAction(board: Board) {
    this.minimax(board, this.depth, board.nextWhiteMove, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, this.offset);
    return of(...board.possibleActions)
      .pipe(max((a, b) => a.score < b.score ? -1 : 1));
  }

  minimax(board: Board, depth: number, maximizing: boolean, alpha: number, beta: number, offset: number): number {
    if (depth === 0 || board.full || board.win) {
      return board.score;
    }
    board.generateActions(offset);
    if (maximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;
      for (const action of board.possibleActions) {
        console.log(`${depth}: ${board.nextWhiteMove} ${action.row} - ${action.col}`);
        const board_new = new Board(board.size);
        Object.assign(board_new, board);
        board_new.move(maximizing, action.col, action.row);
        action.score = this.minimax(board_new, depth - 1, !maximizing, alpha, beta, offset);
        const oldMax = maxEval;
        maxEval = Math.max(maxEval, action.score);
        console.log('max: ', oldMax, action.score, ' -> ', maxEval);
        alpha = Math.max(alpha, action.score);
        if (beta <= alpha) {
          console.log('max pruned!')
          break;
        }
      }
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;
      for (const action of board.possibleActions) {
        console.log(`${depth}: ${board.nextWhiteMove} ${action.row} - ${action.col}`);
        // const board_new = new Board(board.size);
        const board_new = JSON.parse(JSON.stringify(board));
        Object.assign(board_new, board);
        board_new.move(maximizing, action.col, action.row);
        action.score = this.minimax(board_new, depth - 1, !maximizing, alpha, beta, offset);
        const oldMin = minEval;
        minEval = Math.min(minEval, action.score);
        console.log('max: ', oldMin, action.score, ' -> ', minEval);
        beta = Math.min(beta, action.score);
        if (beta <= alpha) {
          console.log('min pruned!')
          break;
        }
      }
      return minEval;
    }
  }
}
