import { Action } from "./action";
import { BigInteger } from "@angular/compiler/src/i18n/big_integer";
import { tryCatch } from "rxjs/internal-compatibility";

export class InvalidMoveError extends Error {
}

export class Board {
  winCount = 5;
  size: number;
  matrix: number[];
  maxPlayer = BigInt(0);
  minPlayer = BigInt(0);
  rows: BigInteger[] = [];
  win: boolean;
  minIndex = 0;
  maxIndex = 0;
  minRow = Number.POSITIVE_INFINITY;
  minCol = Number.POSITIVE_INFINITY;
  maxRow = Number.NEGATIVE_INFINITY;
  maxCol = Number.NEGATIVE_INFINITY;
  nextWhiteMove: boolean;
  score = 0;
  possibleActions: Action[] = [];

  constructor(size: number, nextWhiteMove = true, matrix?: number[]) {
    this.size = size;
    if (matrix) {
      this.matrix = [...matrix];
    } else {
      this.matrix = Array(size * size).fill(0);
    }
    this.nextWhiteMove = nextWhiteMove;
    this.win = false;
  }

  clone() {
    const board = new Board(this.size, this.nextWhiteMove, this.matrix);
    board.score = this.score;
    return board;
  }

  toMatrix() {
    const matrix = [];
    for (let row = 0; row < this.size; row++) {
      matrix.push(this.matrix
        .slice(row * this.size, (row + 1) * this.size)
        .map(value => [0, 1].includes(value) ? ' ' + value : value)
        .join(' '));
    }
    return matrix.join('\n');
  }

  generateRandomMatrix() {
    this.matrix = this.matrix.map(() => Math.floor(Math.random() * 3 - 1));
  }

  generateRandomMoves(moves: number) {
    Array(moves).fill(0).map(() => {
        for (; ;) {
          try {
            this.move(
              this.nextWhiteMove,
              Math.floor(Math.random() * this.size),
              Math.floor(Math.random() * this.size)
            );
            break;
          } catch (e) {
          }
        }
      }
    );
  }

  private checkMove(mask: bigint) {
    if (this.maxPlayer & mask || this.minPlayer & mask) {
      throw new InvalidMoveError(`Cell occupied`);
    }
  }

  move(isWhite: boolean, col: number, row: number) {
    if (col >= this.size || row >= this.size || col < 0 || row < 0) {
      throw new InvalidMoveError(`Cell out of board`);
    }
    if (isWhite !== this.nextWhiteMove) {
      throw new InvalidMoveError(`Wrong player`);
    }
    const idx = row * this.size + col;
    const moveMask = BigInt(1) << BigInt(idx);
    this.checkMove(moveMask);
    if (isWhite) {
      this.maxPlayer |= moveMask;
    } else {
      this.minPlayer |= moveMask;
    }
    this.matrix[idx] = isWhite ? 1 : -1;
    this.minIndex = Math.min(this.minIndex, idx);
    this.maxIndex = Math.max(this.maxIndex, idx);
    this.minRow = Math.min(col, this.minRow);
    this.minCol = Math.min(row, this.minCol);
    this.maxRow = Math.max(col, this.maxRow);
    this.maxCol = Math.max(row, this.maxCol);
    this.nextWhiteMove = !this.nextWhiteMove;
    this.updateScore(row, col);
  }

  generateActions() {
    this.possibleActions = [];
    if (this.minRow === Number.POSITIVE_INFINITY) {
      this.possibleActions.push(new Action(Math.floor(this.size / 2), Math.floor(this.size / 2)));
    } else {
      for (let col = Math.max(this.minCol - this.winCount, 0);
           col <= Math.min(this.maxCol + this.winCount, this.size - 1);
           col++) {
        for (let row = Math.max(this.minRow - this.winCount, 0);
             row <= Math.min(this.maxRow + this.winCount, this.size - 1);
             row++) {
          if (this.matrix[row * this.size + col] === 0) {
            this.possibleActions.push(new Action(row, col));
          }
        }
      }
    }
  }

  private evalHorizontal(row: number, col: number): number {
    return Math.random() * 100 * (this.nextWhiteMove ? 1 : -1);
  }

  private evalVertical(row: number, col: number): number {
    return Math.random() * 100 * (this.nextWhiteMove ? 1 : -1);
  }

  private evalDiagonalL(row: number, col: number): number {
    return Math.random() * 100 * (this.nextWhiteMove ? 1 : -1);
  }

  private evalDiagonalR(row: number, col: number): number {
    return Math.random() * 100 * (this.nextWhiteMove ? 1 : -1);
  }

  private updateScore(row: number, col: number) {
    this.score =
      this.evalHorizontal(row, col)
      + this.evalVertical(row, col)
      + this.evalDiagonalL(row, col)
      + this.evalDiagonalR(row, col);
    // console.log(this.score);
  }
}
