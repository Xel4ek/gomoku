import { BitBoard } from './bit-board';
import { Board } from "./board";
import { BigInteger } from "@angular/compiler/src/i18n/big_integer";

describe('BitBoard', () => {
  let board: BitBoard;

  beforeEach(() => {
    board = new BitBoard(8);
    board.boards.max.orig = BigInt(
      "0b" +
      "000000000" +
      "000000100" +
      "000000100" +
      "001111100" +
      "010000100" +
      "010000100" +
      "001111100" +
      "000000000"
    );

  });

  it('should print bitboard', () => {
    // let bitboard = BigInt(
    //   "0b" +
    //   "10000000" +
    //   "01000000" +
    //   "00100000" +
    //   "00010000" +
    //   "00001000" +
    //   "00000100" +
    //   "00000010" +
    //   "00000001"
    // );
    // let bb = BigInt(
    //   "0b" +
    //   "10000000" +
    //   "10000000" +
    //   "10000000" +
    //   "10000000" +
    //   "10000000" +
    //   "10000000" +
    //   "10000000"
    // );
    let bb = BigInt(
      "0b" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001"
    );
    const sq = (((bb >> BigInt(3) | (bb << BigInt(3)) & BigInt(63)))) ^ BigInt(56);
    // bitboard = (bitboard + BigInt(8) * (bitboard&BigInt(7))) & BigInt(63);
    // bitboard = (bitboard + BigInt(8) * ((bitboard&BigInt(7)^BigInt(7)))) & BigInt(63);
    console.log(board.printBitBoard(sq));
  });

  it('should checkWin', () => {
    const win = BigInt("0b1111100011011000");
    board.boards.max.orig |= win;
    expect(board.checkMask(board.masks.five, true)).toEqual({ row: 1, col: 3 });
    console.log(board.printBitBoard(board.boards.max.orig));
    console.log(board.printBitBoard(board.boards.max.rotate90));
  });

  it('should rotate90 board', () => {
    console.log(board.printBitBoard(board.boards.max.orig));
    board.checkMask(board.masks.five, true);
    console.log(board.printBitBoard(board.boards.max.rotate90));
  });

  it('should count bits', () => {
    let count = 0;
    const i = BigInt("0b111");
    for (let j = 0; j < 1000; j++) {
      // console.log(
      count += board.countBits(i);
      // );
    }
    expect(board.countBits(i)).toEqual(3);
  });

  it('should count lines', () => {
    board.player = "max";
    board.boards.min.orig = BigInt("0b01110")
    console.log(board.printBitBoard(board.boards.max.orig));
    console.log(board.detectLines());
  });

});
