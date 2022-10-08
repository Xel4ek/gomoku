import {Injectable} from '@angular/core';
import {BoardBits} from "./boardBits";
import {DirectionNew, InvalidMoveError} from "./bit-board";
import {BoardAction} from "../ai/action";
import {BoardPrinterService} from "./board-printer.service";
import {LoggerService} from "../logger/logger.service";
import {Mat, Num} from "pts";
import { GameBoard } from "../../interfaces/gameBoard";

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
  kMasksFiles: { [key: number]: bigint } = {};
  kMasksRanks: { [key: number]: bigint } = {};
  kMasksDiag: { [key: number]: bigint } = {};

  constructor(private readonly boardPrinterService: BoardPrinterService,
              private readonly logger: LoggerService,
  ) {
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
    this.createKMasks();

  }

  private createKMasks() {
    const size = this.size * this.size;
    for (let i = 0; size >> BigInt(i + 1); i++) {
      const base = Array.from({length: Math.pow(2, i)})
      const pattern = base.fill('0').join('') + base.fill('1').join('');
      const str = Array.from({length: Number(size) / pattern.length}).fill(pattern).join('');
      this.kMasksFiles[i] = BigInt('0b' + str);
    }
    for (let i = 0; this.size >> BigInt(i + 1); i++) {
      this.kMasksDiag[i] = (this.kMasksFiles[i] & this.kMasksFiles[i + Math.log2(Number(this.size))]);
    }
  }

  private _createKMasks() {
    const size = this.size * this.size;
    for (let i = 0; size >> BigInt(i); i++) {
      this.kMasksFiles[i] = this.kMaskFiles(size, BigInt(i));
      this.kMasksRanks[i] = this.kMaskRanks(32, BigInt(i));
      this.kMasksDiag[i] = (this.kMasksFiles[i] & this.kMasksRanks[i]);
    }
  }

  private setSize() {
    while (this.size < this.sizeField) {
      this.size <<= 1n;
    }
  }

  createEmpty(): BoardBits {
    return new BoardBits(this.size, 0n, 0n, 0n);
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
  deltaSwap(b: bigint, mask: bigint, delta: bigint): bigint {
    const x = BigInt.asUintN(this.sizeBits, (b ^ (b >> delta)) & mask);
    return (x ^ BigInt.asUintN(this.sizeBits, x << delta) ^ b);
  }

  pMask(i: number) {
    const s = 1n << BigInt(i);
    const f = BigInt.asUintN(this.sizeBits, 1n << s);
    return BigInt.asUintN(this.sizeBits, -1n) / (f + 1n);
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

  _pseudoRotate45AnticlockwiseAnySize(x: bigint, size: number) {
    const k: bigint[] = [];
    for (let i = 0n; i < 5n; i++) {
      k.push(BigInt.asUintN(size, this.kMaskFiles(BigInt(size), i)));
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
    let mask = x;
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
    mask ^= (k1 & (mask ^ this.rotateRight(mask, 8n, size)));
    mask ^= (k2 & (mask ^ this.rotateRight(mask, 16n, size)));
    mask ^= (k4 & (mask ^ this.rotateRight(mask, 32n, size)));
    // mask ^= k8 & (mask ^ rotateRight(mask, 64n, size));
    return mask;
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
    for (const i in this.kMasksFiles) {
      x = ((x >> this.size * (1n << BigInt(i))) & this.kMasksFiles[i])
        | BigInt.asUintN(this.sizeBits, (x & this.kMasksFiles[i]) << (this.size * (1n << BigInt(i))));
      this.logger.log(x);
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

  _kMaskRanks(size: number, k: bigint) {
    return this.pAdicNumber(BigInt(size * size), k + 5n);
  }

  kMaskRanks(size: number, k: bigint) {
    let mask = 0n;
    let p = this.pAdicNumber(BigInt(size), k);
    let i = 0n;
    while (p) {
      if ((p & 1n) === 1n) {
        mask |= (this.firstFile << (this.size * i));
      }
      p >>= 1n;
      i++;
    }
    return mask;
  }

  kMaskFiles(size: bigint, k: bigint) {
    const rightHalf = this.pAdicNumber(size >> 1n, k);
    const leftHalf = (BigInt.asUintN(Number(size), rightHalf << ((size >> 1n) + (size & 1n))));
    return rightHalf | leftHalf;
  }

  pAdicNumber(size: bigint, k: bigint) {
    return BigInt.asUintN(Number(size), -1n) / ((1n << (1n << k)) + 1n);
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

  /**
   * Flip a bitboard about the diagonal a1-h8.
   * Square h1 is mapped to a8 and vice versa.
   * @param x any bitboard
   * @return bitboard x flipped about diagonal a1-h8

   U64 flipDiagA1H8(U64 x) {
  U64 t;
  const U64 k1 = C64(0x5500550055005500);
  const U64 k2 = C64(0x3333000033330000);
  const U64 k4 = C64(0x0f0f0f0f00000000);
  t  = k4 & (x ^ (x << 28));
  x ^=       t ^ (t >> 28) ;
  t  = k2 & (x ^ (x << 14));
  x ^=       t ^ (t >> 14) ;
  t  = k1 & (x ^ (x <<  7));
  x ^=       t ^ (t >>  7) ;
  return x;
}
   */

  flipDiagA1H8(z: bigint, size: bigint): bigint {
    let x = BigInt(z);
    const pow = Math.log2(Number(size));
    let poh = ((size * size) >> 1n) - BigInt(Math.pow(2, pow - 1));
    for (let i = pow; i > 0; i--) {
      x = this.deltaSwap(x, this.kMasksDiag[i - 1], poh);
      poh >>= 1n;
    }
    return x;
  }

  _flipDiagA1H8(z: bigint, size: bigint): bigint {
    let x = BigInt(z);
    const pow = Math.log2(Number(size));
    let poh = ((size * size) >> 1n) - BigInt(Math.pow(2, pow - 1));
    for (let i = pow; i > 0; i--) {
      const t = this.kMasksDiag[i - 1] & (z ^ (z << poh));
      x ^= (t ^ (t >> poh));
      poh >>= 1n;
    }
    return x;
  }

  pseudoRotate45AnticlockwiseAnySize(x: bigint, size: number) {
    const k: bigint[] = [];
    for (let i = 0n; i < 5n; i++) {
      k.push(BigInt.asUintN(size, this.kMaskFiles(BigInt(size), i)));
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

  rotate90antiClockwise(x: bigint): bigint {
    // return this.flipDiagA1H8(this.flipVertical(x), this.size);
    return this.flipDiagA1H8(x, this.size);
  }

  /**
   * Flip, mirror or reverse a bitboard
   * @return bitboard x flipped, mirrored or reversed

   U64 flipMirrorOrReverse(U64 x, bool flip, bool mirror)
   {
      for (U32 i = 3*(1-mirror); i < 3*(1+flip); i++) {
      int s(      1  << i);
      U64 f( C64( 1) << s);
      U64 k( C64(-1) / (f+1) );
      x = ((x >> s) & k) + f*(x & k);
    }
    return x;
    }
   */

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
      actions.push(new BoardAction(board.sizeNumber, lsb, -1, -1));
      moves &= ~lsb // clear LSB
    }
    return actions;
  }

  checkWin(board: bigint): boolean {
    for (let dir of [DirectionNew.E, DirectionNew.S, DirectionNew.SE, DirectionNew.SW]) {
      let length = 0;
      let bits = board;
      while (bits) {
        length++;
        if (length >= 5) {
          return true;
        }
        bits &= bits >> this.shift[dir];
      }
    }
    return false;
  }

  generateBoards(board: BoardBits, dilation: number = 1, side: 'red' | 'blue'): void {
    //TODO: checkwin() должен работать на повернуты бордах
    // TODO: после нахождения checkWin() должны генериться новые childBoards c capture движениями
    if (this.checkWin(board[side === 'red' ? 'blue' : 'red']) && this.nonCapture(board)) {
      console.log('CHECKWIN!', side);
      return;
    }
    const occupied = board.red | board.blue;
    let moves = this.dilateBoard(dilation, occupied);
    //TODO: do not generate illegal moves
    moves = (moves | board.border) ^ board.border ^ board.red ^ board.blue;
    while (moves) {
      const lsb = moves & -moves;
      const newBoard = board.clone();
      newBoard[side] |= lsb;
      const moveIndex = this.getFieldIndex(board.border, lsb);
      side === "red" ? newBoard.moveRed = moveIndex : newBoard.moveBlue = moveIndex;
      board.childBoards.push(newBoard);
      moves &= ~lsb // clear LSB
    }
  }

  private dilateBoard(dilation: number, board: bigint) {
    for (let i = dilation; i > 0; i--) {
      board = board
        | (board >> this.shift.S)
        | (board >> this.shift.N)
        | (board >> this.shift.E)
        | (board >> this.shift.NE)
        | (board >> this.shift.SE)
        | (board >> this.shift.NW)
        | (board >> this.shift.SW)
        | (board >> this.shift.W);
    }
    return board;
  }

  getFieldIndex(border: bigint, mask: bigint): number {
    let i = 0;
    for (mask; mask > 1n; mask >>= 1n) {
      if ((border & 1n) === 0n) {
        i++;
      }
      border >>= 1n;
    }
    return i;
  }


  //TODO: make nonCapture() - findPattern
  private nonCapture(board: BoardBits) {
    //TODO: Запрещенные ходы:
    //   1. Противник уже выиграл
    // 2. Запрещенная комбинация
    // 3. Захват фишек игрока.
    return true;
  }
}
