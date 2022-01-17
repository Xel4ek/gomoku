import { TestBed } from '@angular/core/testing';

import { BoardPrinterService } from './board-printer.service';

export enum Side {
  PLAYER,
  ENEMY
}

function rotateRight(x: bigint, s: bigint, size: number) {
  const full = (1n << BigInt(size)) - 1n;
  return (x >> s) | ((x << (BigInt(size) - s) & full));
}

function rotateLeft(x: bigint, s: bigint, size: number) {
  const full = (1n << BigInt(size)) - 1n;
  return ((x << s) & full) | (x >> (BigInt(size) - s));
}

/**
 * Flip, mirror or reverse a bitboard
 * @param x any bitboard
 * @param flip the bitboard
 * @param mirror the bitboard
 * @return bitboard x flipped, mirrored or reversed
 */
// function flipMirrorOrReverse(x: bigint, flip: boolean, mirror: boolean) {
//   for (let i = 3 * (1 - (+ mirror)); i < 3 * (1 + (+flip)); i++) {
//     const s = 1n << i;
//     const f = 1 << s;
//     const k = -1 / (f + 1);
//     x = ((x >> BigInt(s)) & BigInt(k)) + BigInt(f) * (x & BigInt(k));
//   }
//   return x;
// }

function pseudoRotate45clockwise(x: bigint, size: number) {
  // const k1 = BigInt(0xAAAAAAAAAAAAAAAA)
  // const k1 = BigInt.asUintN(size, -1n) / 3n;
  // const k2 = BigInt.asUintN(size, -1n) / 5n;
  // const k4 = BigInt.asUintN(size, -1n) / 17n;
  const k1 = BigInt.asUintN(64, 0xAAAAAAAAAAAAAAAAn);
  const k2 = BigInt.asUintN(64, 0xCCCCCCCCCCCCCCCCn);
  const k4 = BigInt.asUintN(64, 0xF0F0F0F0F0F0F0F0n);
  console.log(k1.toString(2), k2.toString(2), k4.toString(2));
  const k5 = BigInt.asUintN(size, -1n) / 257n;
  // const k2 = BigInt(0xCCCCCCCCCCCCCCCC);
  // const k4 = BigInt(0xF0F0F0F0F0F0F0F0);
  x ^= k1 & (x ^ rotateRight(x, 8n, size));
  x ^= k2 & (x ^ rotateRight(x, 16n, size));
  x ^= k4 & (x ^ rotateRight(x, 32n, size));
  return x;
}

function pseudoRotate45antiClockwise(x: bigint, size: number) {
  // const k1 = BigInt(0xAAAAAAAAAAAAAAAA)
  // const k1 = BigInt.asUintN(size, -1n) / 3n;
  // const k2 = BigInt.asUintN(size, -1n) / 5n;
  // const k4 = BigInt.asUintN(size, -1n) / 17n;
  const k1 = BigInt.asUintN(64, 0x5555555555555555n);
  const k2 = BigInt.asUintN(64, 0x3333333333333333n);
  const k4 = BigInt.asUintN(64, 0x0F0F0F0F0F0F0F0Fn);
  console.log(k1.toString(2), k2.toString(2), k4.toString(2));
  const k5 = BigInt.asUintN(size, -1n) / 257n;
  // const k2 = BigInt(0xCCCCCCCCCCCCCCCC);
  // const k4 = BigInt(0xF0F0F0F0F0F0F0F0);
  x ^= k1 & (x ^ rotateRight(x, 8n, size));
  x ^= k2 & (x ^ rotateRight(x, 16n, size));
  x ^= k4 & (x ^ rotateRight(x, 32n, size));
  return x;
}

describe('BoardPrinterService', () => {
  let service: BoardPrinterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardPrinterService);
  });

  /**
   * Pseudo rotate a bitboard 45 degree clockwise.
   * Main Diagonal is mapped to 1st rank
   * @param x any bitboard
   * @return bitboard x rotated
   */

  it('should be created', () => {
    let board: bigint;
    board = BigInt("0b" +
      "11111111" +
      "10000001" +
      "10100001" +
      "10000001" +
      "10000001" +
      "10000001" +
      "10000001" +
      "11111111"
    );
    board = BigInt("0b" +
      "10101010" +
      "01010101" +
      "10101010" +
      "01010101" +
      "10101010" +
      "01010101" +
      "10101010" +
      "01010101"
    );
    board = BigInt("0b" +
      "10001000" +
      "01000100" +
      "00100010" +
      "00010001" +
      "00001000" +
      "00000100" +
      "00000010" +
      "00000001"
    );
    // board = BigInt("0b" +
    //   "00000001" +
    //   "00000010" +
    //   "00000100" +
    //   "00001000" +
    //   "00010000" +
    //   "00100000" +
    //   "01000000" +
    //   "10000000"
    // );
    // console.log(flipMirrorOrReverse(board, true, false));
    console.log(board.toString(2));
    console.log(service.printBitBoard(board, 8));
    console.log(rotateRight(board, 10n, 8 * 8).toString(2));
    console.log(service.printBitBoard(pseudoRotate45clockwise(board, 8 * 8), 8));
    const k1 = BigInt.asUintN(64, 0xAAAAAAAAAAAAAAAAn);
    const k2 = BigInt.asUintN(64, 0xCCCCCCCCCCCCCCCCn);
    const k4 = BigInt.asUintN(64, 0x0F0F0F0F0F0F0F0Fn);
    console.log(service.printBitBoard(k1, 8));
    console.log(service.printBitBoard(k2, 8));
    console.log(service.printBitBoard(k4, 8));
    console.log(service.printBitBoard(pseudoRotate45antiClockwise(board, 8 * 8), 8));
    expect(service).toBeTruthy();
  });
});
