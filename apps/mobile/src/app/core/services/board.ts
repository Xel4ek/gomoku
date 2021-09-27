import { Action } from "./action";
import { BigInteger } from "@angular/compiler/src/i18n/big_integer";

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
  scores = {
    min: 0,
    twoOpen: 25,
    threeOpen: 50,
    fourOpen: 100,
    max: 100
  };
  maskH: bigint;
  maskV: bigint;
  maskDL: bigint;
  maskDR: bigint;

  constructor(size: number, nextWhiteMove = true, matrix?: number[]) {
    this.size = size;
    if (matrix) {
      this.matrix = [...matrix];
    } else {
      this.matrix = Array(size * size).fill(0);
    }
    this.nextWhiteMove = nextWhiteMove;
    this.win = false;
    this.maskH = BigInt('0b' + Array(this.winCount).fill(1).join(''));
    const arr = Array(this.winCount).fill(Array(this.size - 1).fill(0).join('') + '1').join('')
    this.maskV = BigInt('0b' + arr);
    const arrDL = Array(this.winCount).fill(Array(this.size).fill(0).join('') + '1').join('');
    this.maskDL = BigInt('0b' + arrDL)
    const arrDR = Array(this.winCount).fill('1').map(((value, index) => Array(this.size - 1 - index).fill(0).join('') + value + Array(index).fill(0).join(''))).join('')
    this.maskDR = BigInt('0b' + arrDR);
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
        .join(', '));
    }
    return matrix.join('\n');
  }

  generateRandomMatrix() {
    this.matrix = this.matrix.map(() => Math.floor(Math.random() * 3 - 1));
  }

  generateRandomMoves(moves: number) {
    const arr = [];
    while (arr.length < moves * 2) {
      const item = Math.floor(Math.random() * this.size * this.size);
      if (arr.indexOf(item) === -1) {
        arr.push(item);
      }
    }
    arr.map(((value, index) => {
      const mask = BigInt(1) << BigInt(value);
      if (index % 2 === 0) {
        this.maxPlayer |= mask;
      } else {
        this.minPlayer |= mask;
      }
    }));
    for (moves; moves >= 0; moves--) {
      this.move(
        this.nextWhiteMove,
        Math.floor(Math.random() * this.size),
        Math.floor(Math.random() * this.size)
      );
    }
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
          if (this.matrix[row * this.size + col] === 0) {
            this.possibleActions.push(new Action(row, col));
          }
        }
      }
    }
  }

  private evalHorizontal(row: number, col: number): number {
    const mask = BigInt(1) << BigInt(this.winCount);


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
    // console.log(this.score);
  }
}
