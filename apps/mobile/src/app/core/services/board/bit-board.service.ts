import { Injectable } from '@angular/core';
import { BoardBits } from "./boardBits";
import { InvalidMoveError } from "./bit-board";
import { GameBoard } from "../ai/ai.service";
import { BoardAction } from "../ai/action";
import { BoardPrinterService } from "./board-printer.service";

export enum Orientation {
  // https://www.chessprogramming.org/Bibob
  LEFR,
  BERLEF,
  LERBEF,
}

enum Direction {
  E = "E",
  N = "N",
  NE = "NE",
  NW = "NW",
  S = "S",
  SE = "SE",
  SW = "SW",
  W = "W",
}

type Shift = {
  [props in Direction]: bigint
}

@Injectable({
  providedIn: 'root'
})
export class BitBoardService {
  //Little-Endian File-Rank mapping => A1, A2, A3...

  size = 1n;
  sizeBits: number;
  allBitsOn: bigint;
  sizeField: bigint;
  firstFile: bigint;
  lastFile: bigint;
  firstRank: bigint;
  lastRank: bigint;
  shift: Shift;
  kMasks: { [i: number]: bigint }[];

  constructor() {
    //TODO: refactor sizeField (put into constructor)
    this.sizeField = 19n;
    this.setSize();
    this.sizeBits = Number(this.size * this.size);
    this.firstFile = (1n << this.size) - 1n;
    this.lastFile = this.firstFile << (this.size * (this.size - 1n));
    this.allBitsOn = BigInt.asUintN(this.sizeBits, ~0n);
    this.firstRank = 0n;
    this.lastRank = 0n;
    for (let i = 0n; i < (this.size * this.size); i += this.size) {
      this.firstRank |= 1n << i;
    }
    for (let i = this.size - 1n; i < (this.size * this.size); i += this.size) {
      this.lastRank |= 1n << i;
    }
    this.shift = {
      E: this.size,
      N: 1n,
      NE: this.size + 1n,
      NW: -this.size + 1n,
      S: -1n,
      SE: this.size - 1n,
      SW: -this.size - 1n,
      W: -this.size,
    };
    this.kMasks = this.createKMasks();
  }

  private createKMasks() {
    const masks = [];
    const size = this.size * this.size;
    for (let i = 0; size >> BigInt(i); i++) {
      masks.push({ [i]: this.kMaskFiles(size, BigInt(i)) });
    }
    return masks;
  }

  private setSize() {
    while (this.size < this.sizeField) {
      this.size <<= 1n;
    }
  }

  createEmpty(): BoardBits {
    return new BoardBits(this.size, 0n, 0n, 0n);
  }

  clone(board: BoardBits): BoardBits {
    return new BoardBits(board.size, board.red, board.blue, board.border);
  }

  setMask(board: bigint, mask: bigint): bigint {
    return board | mask;
  }

  rotateRight(x: bigint, s: bigint, size: number) {
    const full = (1n << BigInt(size)) - 1n;
    return (x >> s) | ((x << (BigInt(size) - s) & full));
  }

  rotateLeft(x: bigint, s: bigint, size: number) {
    const full = (1n << BigInt(size)) - 1n;
    return ((x << s) & full) | (x >> (BigInt(size) - s));
  }

  private rankMask(rank: bigint): bigint {
    return ((1n << this.size) - 1n) << (this.size * rank);
  }

  /**
   * swap any none overlapping pairs of bits
   *   that are delta places apart
   * @param b any bitboard
   * @param mask has a 1 on the least significant position
   *             for each pair supposed to be swapped
   * @param delta of pairwise swapped bits
   * @return bitboard b with bits swapped
   */
  deltaSwap(b: bigint, mask: bigint, delta: bigint) {
    const x = BigInt.asUintN(this.sizeBits, (b ^ (b >> delta)) & mask);
    return (x ^ BigInt.asUintN(this.sizeBits, x << delta) ^ b);
  }


  //TODO: what is 3 here?
  flipMirrorOrReverse(x: bigint, flip: boolean, mirror: boolean) {
    for (let i = 3 * (1 - +mirror); i < 3 * (1 + +flip); i++) {
      const s = 1n << BigInt(i);
      const f = BigInt.asUintN(this.sizeBits, 1n << s);
      const k = BigInt.asUintN(this.sizeBits, -1n) / (f + 1n);
      x = ((x >> s) & k) + f * (x & k);
    }
    return x;
  }

  pseudoRotate45AnticlockwiseAnySize(x: bigint, size: number) {
    const k: bigint[] = [];
    for (let i = 0n; i < 5n; i++) {
      k.push(BigInt.asUintN(size, this.kMaskRanks(BigInt(size), i)));
    }

    // const k1 = BigInt.asUintN(size, this.kMaskRanks(BigInt(this.size), 0n));
    // const k2 = BigInt.asUintN(size, this.kMaskRanks(BigInt(this.size), 1n));
    // const k4 = BigInt.asUintN(size, this.kMaskRanks(BigInt(this.size), 2n));
    k.forEach(((value, index) => {
      x ^= value & (x ^ this.rotateRight(x, this.size << BigInt(index), size));
    }));
    // x ^= k1 & (x ^ this.rotateRight(x, 8n, size));
    // x ^= k2 & (x ^ this.rotateRight(x, 16n, size));
    // x ^= k4 & (x ^ this.rotateRight(x, 32n, size));
    return x;
  }

  pseudoRotate45clockwiseAnySize(x: bigint, size: number) {
    const k: bigint[] = [];
    for (let i = 0n; i < 5n; i++) {
      k.push(BigInt.asUintN(size, this.kMaskFiles(BigInt(size), i) << (1n << i)));
    }

    // const k8 = BigInt.asUintN(size, this.kMaskFiles(BigInt(size), 3n) << 8n);
    // const k16 = BigInt.asUintN(size, this.kMaskFiles(BigInt(size), 4n) << 16n);
    k.forEach(((value, index) => {
      x ^= value & (x ^ this.rotateRight(x, this.size << BigInt(index), size));
    }));
    // x ^= k2 & (x ^ this.rotateRight(x, this.size << 1n, size));
    // x ^= k4 & (x ^ this.rotateRight(x, this.size << 2n, size));
    // x ^= k8 & (x ^ this.rotateRight(x, this.size << 3n, size));
    // x ^= k16 & (x ^ this.rotateRight(x, this.size << 4n, size));
    return x;
  }

  pseudoRotate45clockwise(x: bigint, size: number) {
    // const k1 = BigInt(0xAAAAAAAAAAAAAAAA)
    // const k1 = BigInt.asUintN(size, -1n) / 3n;
    // const k2 = BigInt.asUintN(size, -1n) / 5n;
    // const k4 = BigInt.asUintN(size, -1n) / 17n;
    // const k5 = BigInt.asUintN(size, -1n) / 257n;
    const k1 = BigInt.asUintN(size * size, 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAn);
    const k2 = BigInt.asUintN(size * size, 0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCn);
    const k4 = BigInt.asUintN(size * size, 0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0n);
    const k8 = BigInt.asUintN(size * size, 0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00n);
    // const k2 = BigInt(0xCCCCCCCCCCCCCCCC);
    // const k4 = BigInt(0xF0F0F0F0F0F0F0F0);
    x ^= k1 & (x ^ this.rotateRight(x, 8n, size));
    x ^= k2 & (x ^ this.rotateRight(x, 16n, size));
    x ^= k4 & (x ^ this.rotateRight(x, 32n, size));
    // x ^= k8 & (x ^ rotateRight(x, 64n, size));
    return x;
  }

  pseudoRotate45antiClockwise(x: bigint, size: number) {
    // const k1 = BigInt(0xAAAAAAAAAAAAAAAA)
    const k1 = BigInt.asUintN(size, -1n) / 3n;
    const k2 = BigInt.asUintN(size, -1n) / 5n;
    const k4 = BigInt.asUintN(size, -1n) / 17n;
    const k5 = BigInt.asUintN(size, -1n) / 257n;
    // const k1 = BigInt.asUintN(size * size, 0x5555555555555555n);
    // const k2 = BigInt.asUintN(size * size, 0x3333333333333333n);
    // const k4 = BigInt.asUintN(size * size, 0x0F0F0F0F0F0F0F0Fn);
    // const k2 = BigInt(0xCCCCCCCCCCCCCCCC);
    // const k4 = BigInt(0xF0F0F0F0F0F0F0F0);
    x ^= k1 & (x ^ this.rotateRight(x, BigInt(size), size));
    x ^= k2 & (x ^ this.rotateRight(x, BigInt(size * 2), size));
    x ^= k4 & (x ^ this.rotateRight(x, BigInt(size * 4), size));
    return x;
  }

  rotate45(x: bigint, flip: boolean, mirror: boolean) {
    for (let i = 3 * (1 - +mirror); i < 3 * (1 + +flip); i++) {
      const s = 1n << BigInt(i);
      const f = BigInt.asUintN(this.sizeBits, 1n << s);
      const k = BigInt.asUintN(this.sizeBits, -1n) / (f + 1n);
      x = ((x >> s) & k) + f * (x & k);
    }
    return x;
  }

  flipVertical64(x: bigint) {
    let y = x;
    this.kMasks.forEach(((value, index) => {
      y = this.deltaSwap(x, value[index], this.size * (1n << BigInt(index)));
      x = ((x >> this.size * (1n << BigInt(index))) & value[index])
        | BigInt.asUintN(this.sizeBits, (x & value[index]) << (this.size * (1n << BigInt(index))));
      console.log(x);
    }));
    for (const k in this.kMasks) {
      console.log(k);
    }
    // x = ((x >>  8n) & k1) | BigInt.asUintN(this.sizeBits, (x & k1) <<  8n);
    // x = ((x >> 16n) & k2) | BigInt.asUintN(this.sizeBits, (x & k2) << 16n);
    // x = ( x >> 32n)       | BigInt.asUintN(this.sizeBits, x << 32n);
    return x;
  }

  /*
  calculate finite 2-adic number for a flip or rotate mask
  can calculate mask for odd and even matrices
   */

  insert_bit(n: bigint, position: bigint, new_bit: 1 | 0) // whether the newly inserted bit is true or false
  {
    let x = n;
    let y = x;
    x <<= 1n;
    if (new_bit)
      x |= (1n << position);
    else
      x &= ~(1n << position);
    x &= ((~0n) << position);
    y &= ~((~0n) << position);
    x |= y;
    return x;
  }

  insertBitShiftRight(n: bigint, position: bigint, new_bit: 1 | 0) // whether the newly inserted bit is
  // true or
  // false
  {
    let x = n;
    let y = x;
    x <<= 1n;
    if (new_bit)
      x |= (1n << position);
    else
      x &= BigInt.asUintN(this.sizeBits, ~(1n << position));
    x &= ((this.allBitsOn) << position);
    y &= BigInt.asUintN(this.sizeBits, ~((this.allBitsOn) << position));
    x |= y;
    return x;
  }

  kMaskRanks(size: bigint, k: bigint) {
    return ((BigInt.asUintN(Number(size), -1n) / ((1n << (1n << k)) + 1n)));
    // for (let i = size * size - (size >> 1n); i > 0; i -= size) {
    //   mask = this.insertBitShiftRight(mask, i, 0);
    // }
    // return BigInt.asUintN(Number(size * size), mask);
  }

  kMaskFiles(size: bigint, k: bigint) {
    const rightHalf = ((BigInt.asUintN(Number(size >> 1n), -1n) / ((1n << (1n << k)) + 1n)));
    const leftHalf = (BigInt.asUintN(Number(size), rightHalf << ((size >> 1n) + (size & 1n))));
    return rightHalf | leftHalf;
  }

  flipVertical(z: bigint, size: bigint = this.size * this.size) {
    if (size == this.size) {
      return z;
    }
    const x = this.flipVertical(z >> (size >> 1n), size >> 1n);
    const y = this.flipVertical(BigInt.asUintN(Number(size >> 1n), z), size >> 1n);
    z = x | (y << (size >> 1n));
    // z = ( z >> (size >> 1n))       | BigInt.asUintN(this.sizeBits, z << (size >> 1n));
    return z;
  }

  rotate90antiClockwise(x: bigint) {
    return 0n;
    // return flipDiagA1H8(flipVertical(x));
  }

  /**
   * Flip, mirror or reverse a bitboard
   * @return bitboard x flipped, mirrored or reversed
   */
//   U64 flipMirrorOrReverse(U64 x, bool flip, bool mirror)
// {
//   for (U32 i = 3*(1-mirror); i < 3*(1+flip); i++) {
//   int s(      1  << i);
//   U64 f( C64( 1) << s);
//   U64 k( C64(-1) / (f+1) );
//   x = ((x >> s) & k) + f*(x & k);
// }
// return x;
// }

  createBorder() {
    let board;
    board = this.firstFile | this.lastFile | this.firstRank | this.lastRank;
    const offset = (this.size - this.sizeField) >> 1n;
    for (let i = 0n; i < offset; i += 1n) {
      board |= (this.firstFile << (this.shift.E * i))
        | (this.lastFile << (this.shift.W * i))
        | (this.firstRank << (this.shift.N * i))
        | (this.lastRank << (this.shift.S * i));
    }
    if (this.sizeField & 1n) {
      board |= (this.firstFile << (this.shift.E * (offset)))
        | (this.lastRank << (this.shift.S * (offset)));

    }
    return board;
  }

  private checkMove(board: BoardBits, mask: bigint) {
    if ((board.red & mask) || (board.blue & mask)) {
      throw new InvalidMoveError(`Cell occupied`);
    }
  }

  moveByMask(board: BoardBits, mask: bigint, side: 'red' | 'blue') {
    board[side] |= mask;
  }

  move(board: BoardBits, col: number, row: number, side: 'red' | 'blue') {
    if (col >= this.sizeField || row >= this.sizeField || col < 0 || row < 0) {
      throw new InvalidMoveError(`Cell out of board`);
    }
    let mask = 1n << BigInt(row);
    mask <<= BigInt(col) * this.size;
    let border = board.border;
    while (border & 1n) {
      mask <<= 1n;
      border >>= 1n;
    }
    this.checkMove(board, mask);
    board[side] |= mask;
  }

  createFromArray(arr: number[], board: BoardBits, side: 'red' | 'blue') {
    const size = Number(this.sizeField);
    arr.forEach((value) => {
      this.move(board, Math.floor(value / size), value % size, side);
    });
  }

  createFromGameBoard(gameBoard: GameBoard) {
    const board = this.createEmpty();
    board.border = this.createBorder();
    this.createFromArray(gameBoard.player.map, board, 'blue');
    this.createFromArray(gameBoard.enemy.map, board, 'red');
    return board;
  }

  generateActions(board: BoardBits, dilation: number = 1): BoardAction[] {
    const actions: BoardAction[] = [];
    const occupied = board.red | board.blue;
    let moves = occupied;
    for (let i = dilation; i > 0; i--) {
      moves = moves
        | (moves >> this.shift.S)
        | (moves >> this.shift.N)
        | (moves >> this.shift.E)
        | (moves >> this.shift.NE)
        | (moves >> this.shift.SE)
        | (moves >> this.shift.NW)
        | (moves >> this.shift.SW)
        | (moves >> this.shift.W);
    }
    moves = (moves | board.border) ^ board.border ^ board.red ^ board.blue;
    while (moves) {
      const lsb = moves & -moves;
      actions.push(new BoardAction(board.sizeNumber, lsb));
      moves &= ~lsb // clear LSB
    }
    return actions;
  }

  getFieldIndex(board: BoardBits, mask: bigint): number {
    let border = board.border;
    let i = 0;
    for (mask; mask > 0; mask >>= 1n) {
      if ((border & 1n) === 0n) {
        i++;
      }
      border >>= 1n;
    }
    return i;
  }
}
