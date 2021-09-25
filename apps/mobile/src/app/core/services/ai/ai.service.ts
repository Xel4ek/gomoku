import { Injectable } from '@angular/core';
import { Board } from "../board";

@Injectable({
  providedIn: 'root'
})
export class AiService {

  minimax(board: Board, depth: number, maximizing: boolean, alpha: number, beta: number, offset: number): number {
    if (depth === 0 || board.full || board.win) {
      return this.positionEvaluation(board);
    }
    if (maximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;
      for (const action of board.generateActions(offset)) {
        const board_new = new Board(board.size);
        Object.assign(board_new, board);
        board_new.move(maximizing, action.col, action.row);
        const posEval = this.minimax(board_new, depth - 1, !maximizing, alpha, beta, offset);
        maxEval = Math.max(maxEval, posEval);
        alpha = Math.max(alpha, posEval);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;
      for (const action of board.generateActions(offset)) {
        const board_new = new Board(board.size);
        Object.assign(board_new, board);
        board_new.move(maximizing, action.col, action.row);
        const posEval = this.minimax(board_new, depth - 1, !maximizing, alpha, beta, offset);
        minEval = Math.min(minEval, posEval);
        beta = Math.min(beta, posEval);
        if (alpha <= beta) break;
      }
      return minEval;
    }
  }

  positionEvaluation(board: Board): number {
    console.log(board);
    return Math.random();
  }

}
