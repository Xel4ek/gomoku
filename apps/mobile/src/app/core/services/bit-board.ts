import { BigInteger } from "@angular/compiler/src/i18n/big_integer";
import { of } from "rxjs";
import { InvalidMoveError } from "./board";

export class BitBoard {
  winCount = 5;
  size: number;
  boards = {
    max: {
      orig: BigInt(0),
      rotate90: BigInt(0),
      rotate45l: BigInt(0),
      rotate45r: BigInt(0),
    },
    min: {
      orig: BigInt(0),
      rotate90: BigInt(0),
      rotate45l: BigInt(0),
      rotate45r: BigInt(0),
    },
  };
  masks = {
    win: BigInt("0b11111"),
  };
  nextWhiteMove: boolean;
  win: boolean;

  constructor(size: number, nextWhiteMove = true) {
    this.size = size;
    this.nextWhiteMove = nextWhiteMove;
    this.win = false;
    this.setMasks();
  }

  printBitBoard(board: BigInt) {
    const matrix = [];
    const str = board.toString(2).split('').reverse();
    for (let row = 0; row < this.size; row++) {
      matrix.push(str
        .slice(row * this.size, (row + 1) * this.size).join(''));
    }
    return matrix.join('\n');
  }

  private setMasks() {
    const mask = BigInt("0b" + Array(this.winCount).fill("1").join(''));
  }

  checkMask(mask: bigint) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col <= this.size - this.winCount; col++) {
        if ((mask & this.boards.max.orig) === mask
          || (mask & this.boards.max.rotate45l) === mask
          || (mask & this.boards.max.rotate45r) === mask
          || (mask & this.boards.max.rotate90) === mask) {
          console.log(`${row} ${col} WIN`);
          return { row: row, col: col };
        }
        mask <<= BigInt(1);
      }
      mask <<= BigInt(this.winCount - 1);
    }
    return {};
  }

  move(isMax: boolean, col: number, row: number) {
    if (col >= this.size || row >= this.size || col < 0 || row < 0) {
      throw new InvalidMoveError(`Cell out of board`);
    }
    if (isMax !== this.nextWhiteMove) {
      throw new InvalidMoveError(`Wrong player`);
    }
    const idx = row * this.size + col;
    const moveMask = BigInt(1) << BigInt(idx);
    this.checkMove(moveMask);
    if (isMax) {
      this.boards.max.orig |= moveMask;
    } else {
      this.boards.min.orig |= moveMask;
    }
    this.nextWhiteMove = !this.nextWhiteMove;
    this.updateScore(row, col);
  }

  private checkMove(mask: bigint) {
    if (this.boards.max.orig & mask || this.boards.min.orig & mask) {
      throw new InvalidMoveError(`Cell occupied`);
    }
  }

  //TODO: implement update score
  private updateScore(row: number, col: number) {
    throw { name: "NotImplementedError" };
  }
}
