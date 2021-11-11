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
    board.score = this.minimax(board, this.depth, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
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
      console.log(`${depth}: ${isMax} ${action.row} - ${action.col}, score: ${action.score}`);
      const newBoard = board.clone();
      newBoard.move(action.col, action.row, isMax ? "player" : "enemy");
      action.score = this.minimax(newBoard, depth - 1, !isMax, alpha, beta);
      evalScore = isMax ? Math.max(evalScore, action.score) : Math.min(evalScore, action.score);
      // console.log(`${depth}: ${isMax} ${action.row} - ${action.col}, score: ${action.score}`);
      // console.log('max: ', oldMax, action.score, ' -> ', maxEval);
      if (isMax) {
        alpha = Math.max(alpha, action.score);
      } else {
        beta = Math.min(beta, action.score);
      }
      if (beta <= alpha) {
        console.log(isMax + " pruned!");
        break;
      }
    }
    return evalScore;
  }


  minimax(board: BitBoard, depth: number, maximizing: boolean, alpha: number, beta: number): number {
    board.generateActions();
    // console.log("isMax: " + maximizing, board.possibleActions);
    // console.log(BitBoard.printBitBoard(board.boards.player, board.size));
    if (depth === 0 || board.checkWin(maximizing) || board.possibleActions.length === 0) {
      const score = board.updateScore();
      console.log("Depth 0. Score: " + score, "WIN: " + board.checkWin(maximizing), "Actions :" + board.possibleActions.length);
      console.log(BitBoard.printBitBoard(board.boards.player, board.size));
      console.log(BitBoard.printBitBoard(board.boards.enemy, board.size));
      return score;
    }
    return this.eval(maximizing, board, depth, alpha, beta);
  }

}
