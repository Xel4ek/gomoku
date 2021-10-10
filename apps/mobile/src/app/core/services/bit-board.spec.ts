import { BitBoard } from './bit-board';
import { Board } from "./board";

describe('BitBoard', () => {
  let board: BitBoard;

  beforeEach(() => {
    board = new BitBoard(8);
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
});
