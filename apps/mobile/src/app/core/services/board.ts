import { Action } from "./action";

export class Board {
  size: number;
  matrix: number[][];
  full: boolean;
  win: boolean;
  minRow = Number.POSITIVE_INFINITY;
  minCol = Number.POSITIVE_INFINITY;
  maxRow = Number.NEGATIVE_INFINITY;
  maxCol = Number.NEGATIVE_INFINITY;
  nextWhiteMove: boolean;

  constructor(size: number) {
    this.size = size;
    this.matrix = Array(size).fill([]).map(() => Array(size).fill(0));
    this.full = false;
    this.win = false;
    this.nextWhiteMove = true;
  }

  generateRandomMatrix() {
    this.matrix = this.matrix.map(row => row.map(() => Math.floor(Math.random() * 3 - 1)));
  }

  move(isWhite: boolean, col: number, row: number) {
    if (col < this.size && row < this.size && col >= 0 && row >= 0 && isWhite === this.nextWhiteMove) {
      this.matrix[row][col] = isWhite ? 1 : -1;
      this.minRow = Math.min(col, this.minRow);
      this.minCol = Math.min(row, this.minCol);
      this.maxRow = Math.max(col, this.maxRow);
      this.maxCol = Math.max(row, this.maxCol);
      this.nextWhiteMove = !this.nextWhiteMove;
    } else
      throw new Error(`Invalid move: isWhite=${isWhite} (${col}, ${row})`);
  }

  generateActions(offset: number): Action[] {
    const actions: Action[] = [];
    for (let col = Math.max(this.minCol - offset, 0);
         col <= Math.min(this.maxCol + offset, this.size - 1);
         col++) {
      for (let row = Math.max(this.minRow - offset, 0);
           row <= Math.min(this.maxRow + offset, this.size - 1);
           row++) {
        if (this.matrix[col][row] === 0) {
          actions.push(new Action(row, col, this));
        }
      }
    }
    return actions;
  }
}
