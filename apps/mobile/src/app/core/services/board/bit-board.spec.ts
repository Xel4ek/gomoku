import { BitBoard } from './bit-board';
import { Combination } from "./combination";

describe('BitBoard', () => {
  let board: BitBoard;

  beforeEach(() => {
    const size = 9;
    const combination = new Combination(size)
    board = new BitBoard(combination.combinations, size);
    board.boards.player = BigInt(
      "0b" +
      "0000000000" +
      "0000000100" +
      "0000000100" +
      "0001111100" +
      "0010000100" +
      "0010000100" +
      "0001111100" +
      "0000000000"
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
    console.log(BitBoard.printBitBoard(sq, board.size));
  });

  it('should checkWin', () => {
    const win = BigInt("0b1111100011011000");
    board.boards.player |= win;
    // expect(board.checkMask(board.combinations.five, true)).toEqual({ row: 1, col: 3 });
    console.log(BitBoard.printBitBoard(board.boards.player, board.size));
  });

  it('should rotate90 board', () => {
    console.log(BitBoard.printBitBoard(board.boards.player, board.size));
    // board.checkMask(board.combinations.five, true);
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
    board.boards.enemy = BigInt("0b01110");
    console.log(BitBoard.printBitBoard(board.boards.player, board.size));
  });

  it('should set masks', () => {
    console.log(board.combinations.forEach(value => value.masksP.forEach(value => console.log(BitBoard.printBitBoard(value, board.size)))));
    // board.comboMasks.map(value => console.log(BitBoard.printBitBoard(value, board.size)));
  });

  it('should create empty board', () => {
    const mask = BigInt("0b" +
      Array(board.size * (board.size + 1))
        .fill("1")
        .map(((value, index) => {
          if (index % (board.size) === 0) {
            return "0";
          }
          return value;
        }))
        .join('')
    )
    expect(board.boards.empty & mask).toBe(mask);
  });

});
