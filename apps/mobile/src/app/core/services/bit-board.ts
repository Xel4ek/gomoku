import { BigInteger } from "@angular/compiler/src/i18n/big_integer";
import { of } from "rxjs";
import { InvalidMoveError } from "./board";

interface Direction {
  [prop: string]: number,
  hor: number,
  vert: number,
  diagSW: number,
  diagSE: number,
}

export class BitBoard {
  winCount = 5;
  size: number;
  shift: Direction;
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
    five: BigInt("0b11111"),
    four1: BigInt("0b1111"),
    four2: BigInt("0b11011"),
    Four3: BigInt("0b11101"),
    three1: BigInt("0b111"),
    three2: BigInt("0b1101"),
    three3: BigInt("0b1011"),
    three4: BigInt("0b10101"),
    three5: BigInt("0b11001"),
    three6: BigInt("0b10011"),
  };
  player: "max" | "min";
  win: boolean;

  constructor(size: number) {
    this.size = size;
    this.win = false;
    //TODO: remove
    this.player = "max";
    this.setMasks();
    this.shift = {
      hor: 1,
      vert: -(this.size + 1),
      diagSW: -(this.size + 1) - 1,
      diagSE: -(this.size + 1) + 1,
    }
  }

  isPowerOfTwo(i: bigint) {
    return i > BigInt(0) && (i & (i - BigInt(1))) === BigInt(0);
  }

  countBits(v: bigint) {
    let c: number;
    for (c = 0; v; c++) {
      v &= v - BigInt(1);
    }
    return c;
  }

  detectLines() {
    const len: Direction = {
      hor: 0,
      vert: 0,
      diagSW: 0,
      diagSE: 0,
    };
    Object.keys(len).forEach(dir => {
      let bits = this.boards[this.player].orig;
      while ((bits = bits & (bits >> BigInt(this.shift[dir]))) != BigInt(0)) {
        len[dir]++;
      }
    });
    return len;
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

  checkMask(mask: bigint, stop: boolean): { dir: string; row: number; col: number }[] {
    this.rotateBoard();
    const position: { dir: string, row: number, col: number }[] = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col <= this.size - this.winCount; col++) {
        for (let [k, v] of Object.entries(this.boards[this.player])) {
          if ((mask & v) === mask) {
            position.push({ dir: k, row: row, col: col });
          }
          if (stop) {
            return position;
          }
        }
        mask <<= BigInt(1);
      }
      mask <<= BigInt(this.winCount - 1);
    }
    return position;
  }

  move(isMax: boolean, col: number, row: number) {
    if (col >= this.size || row >= this.size || col < 0 || row < 0) {
      throw new InvalidMoveError(`Cell out of board`);
    }
    // if (isMax !== this.nextWhiteMove) {
    //   throw new InvalidMoveError(`Wrong player`);
    // }
    const idx = row * this.size + col;
    const moveMask = BigInt(1) << BigInt(idx);
    this.checkMove(moveMask);
    if (isMax) {
      this.boards.max.orig |= moveMask;
    } else {
      this.boards.min.orig |= moveMask;
    }
    // this.nextWhiteMove = !this.nextWhiteMove;
    this.updateScore(row, col);
  }

  private rotateBoard() {
    // sq' = (((sq >> 3) | (sq << 3)) & 63) ^ 56;
    this.boards[this.player].rotate90 = this.boards[this.player].orig ^ BigInt(this.size * this.size - this.size);
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

  // getBoradEval() {
  //   if f(FiveInrow.size()! = 0) then;
  //   BoardEval + = 100000;
  //   if f(openfour.size() == 1) then;
  //   BoardEval + = 15000;
  //   if f((openthree.size() ≥
  //   2;
  // )||
  //   (Deadfour.size() == 2) || (Deadfour.size() == 1
  //   openthree.size() == 1;
  // ))
  //   then;
  //   BoardEval + = 10000;
  //   if f(openthree.size() + jopenthree.size() == 2) then;
  //   BoardEval + = 5000;
  //   if f(closedfour.size()! = 0) then;
  //   BoardEval + = 1000;
  //   if f(Jclosedfour.size()! = 0) then;
  //   BoardEval + = 300;
  //   if f(Cclosedfour.size()! = 0) then;
  //   BoardEval + = (Cclosedfour.size() ∗ 50;
  // )
  //   throw { name: "NotImplementedError" };
  // }
}
