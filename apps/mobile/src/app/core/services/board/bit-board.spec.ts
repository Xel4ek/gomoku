import { from } from 'rxjs';
import { BitBoard } from './bit-board';
import { Combination, Dir } from "./combination";

describe('BitBoard', () => {
  let board: BitBoard;
  const size = 8;
  const combination = new Combination(size);

  beforeEach(() => {
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
    const bb = BigInt(
      "0b" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "00000001" +
      "000000010"
    );
    console.log(BitBoard.printBitBoard(bb, 7));
    const sq = (((bb >> BigInt(3) | (bb << BigInt(3)) & BigInt(63)))) ^ BigInt(56);
    // bitboard = (bitboard + BigInt(8) * (bitboard&BigInt(7))) & BigInt(63);
    // bitboard = (bitboard + BigInt(8) * ((bitboard&BigInt(7)^BigInt(7)))) & BigInt(63);
    console.log(BitBoard.printBitBoard(sq, board.size));
  });

  it('should checkWin', () => {
    const win = BigInt("0b11111");
    const win45 = Combination.rotate(win, 5, 5, Dir.SE, 10);
    board.boards.player |= win;
    expect(board.checkWin(true)).toBeTruthy();
    board.boards.player |= win45;
    expect(board.checkWin(true)).toBeTruthy();
    console.log(BitBoard.printBitBoard(board.boards.player, board.size));
  });

  it('should get score', () => {
    console.log(board.updateScore());
    console.log(BitBoard.printBitBoard(board.boards.player, board.size));
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
    );
    expect(board.boards.empty & mask).toBe(mask);
  });

  it('should find Five in row', () => {
    const mask = BigInt('0b11111');
    const shifts = [BigInt(size + 2), 2n, 1n];
    const boards: bigint[] = [];
    const score: number[] = [];
    from(combination.combinations)
      .subscribe(combo => {
        from(shifts).subscribe(shift => {
          board.boards.player = combo.maskP << shift;
          boards.push(board.boards.player);
          score.push(board.updateScore());
        });
      });
    const fails = score.map((v, i) => v === 0 ? i : null).filter(x => typeof x === "number");
    for (const fail of fails) {
      if (typeof fail === "number") {
        console.log(BitBoard.printBitBoard(boards[fail], size));
      }
    }
    score.find(((value, index) => value === 0));
    expect(score.every(value => value > 0)).toBeTruthy();
  });

});
