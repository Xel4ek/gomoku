import { Action } from "./action";

export class Board {
  size: number;
  matrix: number[][];
  full: boolean;
  win: boolean;
  count = 0;
  minRow = Number.POSITIVE_INFINITY;
  minCol = Number.POSITIVE_INFINITY;
  maxRow = Number.NEGATIVE_INFINITY;
  maxCol = Number.NEGATIVE_INFINITY;
  nextWhiteMove: boolean;
  score = 0;
  possibleActions: Action[] = [];
  scores = {
    min: 0,
    twoOpen: 10,
    threeOpen: 90,
    fourOpen: 90,
    max: 100
  };

  constructor(size: number, matrix?: number[][]) {
    this.size = size;
    // this.maxCol = Math.floor((size - 1) / 2);
    // this.maxRow = Math.floor((size - 1) / 2);
    // this.minCol = Math.floor((size - 1) / 2);
    // this.minRow = Math.floor((size - 1) / 2);
    if (matrix) {
      this.matrix = JSON.parse(JSON.stringify(matrix))
    } else {
      this.matrix = Array(size).fill([]).map(() => Array(size).fill(0));
    }
    this.full = false;
    this.win = false;
    this.nextWhiteMove = true;
  }

  generateRandomMatrix() {
    this.matrix = this.matrix.map(row => row.map(() => Math.floor(Math.random() * 3 - 1)));
  }

  generateRandomMoves(moves: number) {
    for (moves; moves >= 0; moves--) {
      this.move(
        this.nextWhiteMove,
        Math.floor(Math.random() * this.size),
        Math.floor(Math.random() * this.size)
      );
    }
  }

  move(isWhite: boolean, col: number, row: number) {
    if (col < this.size && row < this.size && col >= 0 && row >= 0 && isWhite === this.nextWhiteMove) {
      this.matrix[row][col] = isWhite ? 1 : -1;
      this.minRow = Math.min(col, this.minRow);
      this.minCol = Math.min(row, this.minCol);
      this.maxRow = Math.max(col, this.maxRow);
      this.maxCol = Math.max(row, this.maxCol);
      this.count += 1;
      if (this.count === this.size * this.size) {
        this.full = true;
      }
      this.nextWhiteMove = !this.nextWhiteMove;
      this.updateScore(row, col);
    } else {
      throw new Error(`Invalid move: isWhite=${isWhite} (${col}, ${row})`);
    }
  }

  generateActions(offset: number) {
    this.possibleActions = [];
    if (this.minRow === Number.POSITIVE_INFINITY) {
      this.possibleActions.push(new Action(Math.floor(this.size / 2), Math.floor(this.size / 2)));
    } else {
      for (let col = Math.max(this.minCol - offset, 0);
           col <= Math.min(this.maxCol + offset, this.size - 1);
           col++) {
        for (let row = Math.max(this.minRow - offset, 0);
             row <= Math.min(this.maxRow + offset, this.size - 1);
             row++) {
          if (this.matrix[col][row] === 0) {
            this.possibleActions.push(new Action(row, col));
          }
        }
      }
    }
  }

  private evalHorizontal(row: number, col: number): number {
    return Math.random() * this.scores.max * (this.nextWhiteMove ? 1 : -1);
  }

  private evalVertical(row: number, col: number): number {
    return Math.random() * this.scores.max * (this.nextWhiteMove ? 1 : -1);
  }

  private evalDiagonalL(row: number, col: number): number {
    return Math.random() * this.scores.max * (this.nextWhiteMove ? 1 : -1);
  }

  private evalDiagonalR(row: number, col: number): number {
    return Math.random() * this.scores.max * (this.nextWhiteMove ? 1 : -1);
  }

  private updateScore(row: number, col: number) {
    this.score =
      this.evalHorizontal(row, col)
      + this.evalVertical(row, col)
      + this.evalDiagonalL(row, col)
      + this.evalDiagonalR(row, col);
    console.log(this.score);
  }
}
