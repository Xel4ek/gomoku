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
  nextWhiteMove: boolean;
  win: boolean;

  constructor(size: number, nextWhiteMove = true) {
    this.size = size;
    this.nextWhiteMove = nextWhiteMove;
    this.win = false;
  }

  printBitBoard(board: BigInt) {
    const matrix = [];
    const str = board.toString(2).split('').reverse();
    for (let row = 0; row < this.size; row++) {
      matrix.push(str
        .slice(row * this.size, (row + 1) * this.size).join(''))
    }
    return matrix.join('\n');
  }

}
