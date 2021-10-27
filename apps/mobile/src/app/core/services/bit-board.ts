import { IBoard, InvalidMoveError } from "./board";
import { GameBoard } from "./ai/ai.service";
import { Action } from "./action";

interface Direction {
  [prop: string]: bigint,

  hor: bigint,
  vert: bigint,
  diagSW: bigint,
  diagSE: bigint,
}

export enum Dir {
  E,
  S,
  SE,
  SW
}

export enum ComboNames {
  OPENFIVE,
  OPENFOUR,
  CLOSEDFOUR,
  OPENTHREE,
  CLOSEDTHREE,
}

interface Combo {
  name: string,
  type: ComboNames,
  maskP: bigint,
  maskO: bigint,
  masksP: bigint[],
  masksO: bigint[],
  cols: number,
  rows: number,
}

export class BitBoard implements IBoard {
  score: number;
  winCount = 5;
  size: number;
  shift: Direction;
  boards = {
    empty: 0n,
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
  combinations: Combo[] = [
    {
      name: "Open Five",
      type: ComboNames.OPENFIVE,
      maskP: BigInt("0b11111"),
      maskO: BigInt("0"),
      masksP: [],
      masksO: [],
      cols: 5,
      rows: 1,
    },
    {
      name: "Open Four",
      type: ComboNames.OPENFOUR,
      maskP: BigInt("0b11110"),
      maskO: BigInt("0b100001"),
      masksP: [],
      masksO: [], cols: 6,
      rows: 1,
    },
    {
      name: "Closed Four 1",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b1111"),
      maskO: BigInt("0b011110"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
    {
      name: "Closed Four 2",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b11011"),
      maskO: BigInt("0b100"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Closed Four 3",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b11101"),
      maskO: BigInt("0b10"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Closed Four 4",
      type: ComboNames.CLOSEDFOUR,
      maskP: BigInt("0b10111"),
      maskO: BigInt("0b1000"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Open Three 1",
      type: ComboNames.OPENTHREE,
      maskP: BigInt("0b1110"),
      maskO: BigInt("0b10001"),
      masksP: [],
      masksO: [], cols: 5,
      rows: 1,
    },
    {
      name: "Open Three 2",
      type: ComboNames.OPENTHREE,
      maskP: BigInt("0b1011"),
      maskO: BigInt("0b100"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
    {
      name: "Open Three 3",
      type: ComboNames.OPENTHREE,
      maskP: BigInt("0b1101"),
      maskO: BigInt("0b10"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
    {
      name: "Closed Three 1",
      type: ComboNames.CLOSEDTHREE,
      maskP: BigInt("0b1110"),
      maskO: BigInt("0b1"),
      masksP: [],
      masksO: [], cols: 4,
      rows: 1,
    },
  ];
  masks: Combo[] = [];
  comboMasks: bigint[] = [];
// {
//     three1: BigInt("0b111"),
//     three2: BigInt("0b1101"),
//     three3: BigInt("0b1011"),
//     three4: BigInt("0b10101"),
//     three5: BigInt("0b11001"),
//     three6: BigInt("0b10011"),
//   };
  player: "max" | "min";
  win: boolean;
  public possibleActions: Action[];
  gameBoard?: GameBoard;

  static printBitBoard(board: bigint, size: number) {
    const matrix = [];
    const str = board.toString(2).split('').reverse();
    for (let row = 0; row < size; row++) {
      matrix.push(str
        .slice(row * size, (row + 1) * size).join(''));
    }
    return matrix.join('\n');
  }

  static rotate(mask: bigint, width: number, height: number, direction: Dir, boardWidth: number): bigint {
    let rotatedMask = 0n;
    for (let i = width; i > 0; i--) {
      const bitMask = 1 << (i - 1);
      const bitP = mask & BigInt(bitMask);
      if (bitP) {
        const shift =
          direction === Dir.SW ? BigInt(boardWidth * (width - i))
            : direction === Dir.SE ? BigInt(boardWidth * (i - 1))
              : BigInt((boardWidth - 1) * (i - 1));
        rotatedMask |= (bitP << shift);
      }
    }
    return rotatedMask;
  }

  constructor(size?: number, gameBoard?: GameBoard) {
    this.possibleActions = [];
    this.score = 0;
    this.size = size ?? 19;
    this.boards.empty = BigInt("0b" + ("0" + "1".repeat(this.size)).repeat(this.size));
    if (gameBoard) {
      this.gameBoard = gameBoard;
      this.boards.max.orig = gameBoard.player;
      this.boards.min.orig = gameBoard.opp;
    } else {
      this.boards.empty = BigInt("0b" +
        Array(this.size * (this.size + 1))
          .fill("1")
          .map(((value, index) => {
            if (index % (this.size) === 0) {
              return "0";
            }
            return value;
          }))
          .join('')
      );
    }
    this.win = false;
    this.player = "max";
    //TODO: remove
    this.rotateCombos(this.combinations);
    this.setMasks();
    this.shift = {
      hor: 1n,
      vert: -(BigInt(this.size) + 1n),
      diagSW: -(BigInt(this.size) + 1n) - 1n,
      diagSE: -(BigInt(this.size) + 1n) + 1n,
    };
  }

  rotateCombos(combos: Combo[]) {
    combos.forEach(combo => {
      [Dir.SW, Dir.SE, Dir.S].forEach(direction => {
        this.combinations.push({
          name: combo.name,
          type: combo.type,
          maskP: BitBoard.rotate(combo.maskP, combo.cols, combo.rows, direction, this.size),
          maskO: BitBoard.rotate(combo.maskO, combo.cols, combo.rows, direction, this.size),
          masksP: [],
          masksO: [],
          cols: combo.cols,
          rows: combo.cols,
        });
      });
    });
  }

  clone(): IBoard {
    return new BitBoard(this.size, this.gameBoard);
  }

  rotateRight(x: bigint, i: bigint) {
    return (x - i) % BigInt(this.size);
  }

  flipDiagonal(x: bigint) {
    const k1 = BigInt(0xAAAAAAAAAAAAAAAAAAAAAAAAAAAA);
    const k2 = BigInt(0xCCCCCCCCCCCCCCCCCCCCCCCCCCCC);
    const k4 = BigInt(0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0);
    x ^= k1 & (x ^ this.rotateRight(x, BigInt(this.size)));
    x ^= k2 & (x ^ this.rotateRight(x, BigInt(this.size * 2)));
    x ^= k4 & (x ^ this.rotateRight(x, BigInt(this.size * 4)));
    return x;
  }

  generateRandomMoves(moves: number) {
    Array(moves).fill(0).map(() => {
        for (; ;) {
          try {
            this.move(
              Math.floor(Math.random() * this.size),
              Math.floor(Math.random() * this.size)
            );
            break;
          } catch (e) {
            return e;
          }
        }
      }
    );
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
      hor: 0n,
      vert: 0n,
      diagSW: 0n,
      diagSE: 0n,
    };
    Object.keys(len).forEach(dir => {
      let bits = this.boards[this.player].orig;
      while ((bits = bits & (bits >> this.shift[dir])) != 0n) {
        len[dir]++;
      }
    });
    return len;
  }

  private setMasks() {
    this.combinations.forEach(combo => {
      let maskP = combo.maskP;
      let maskO = combo.maskO;
      for (let row = 0; row < (this.size - combo.rows); row++) {
        for (let col = 0; col <= (this.size - combo.cols); col++) {
          combo.masksP.push(maskP);
          combo.masksO.push(maskO);
          this.comboMasks.push(maskP);
          this.comboMasks.push(maskO),
            maskP <<= 1n;
          maskO <<= 1n;
        }
        maskP <<= BigInt(combo.cols + 1);
        maskO <<= BigInt(combo.cols + 1);
      }
    });
  }

  checkMask(mask: bigint, stop: boolean): { dir: string; row: number; col: number }[] {
    this.rotateBoard();
    const position: { dir: string, row: number, col: number }[] = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col <= this.size - this.winCount; col++) {
        for (const [k, v] of Object.entries(this.boards[this.player])) {
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

  move(col: number, row: number) {
    //TODO: refactor this
    const isMax = this.player === "max";
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
    this.score = this.updateScore(row, col);
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
    const match: Combo[] = [];
    this.combinations.forEach(combo => {
      combo.masksP.forEach(((value, index) => {
        if ((value & this.boards.max.orig) === value
          && (combo.masksO[index] & this.boards.min.orig) === combo.masksO[index]) {
          match.push(combo);
        }
      }));
    });
    return this.calculateScore(match);
    // return Math.random() * 100000;
  }

  private calculateScore(combos: Combo[]): number {
    type Scores = {
      [key: number]: number,
    }
    const count: Scores = {
      [ComboNames.OPENFIVE]: 0,
      [ComboNames.OPENFOUR]: 0,
      [ComboNames.CLOSEDFOUR]: 0,
      [ComboNames.OPENTHREE]: 0,
      [ComboNames.CLOSEDTHREE]: 0,
    };
    combos.forEach(value => {
      count[value.type] += 1;
    });
    let score = 0;
    if (count[ComboNames.OPENFIVE] > 0) {
      score += 100000;
    }
    if (count[ComboNames.OPENFOUR] > 0) {
      score += 15000;
    }
    if (count[ComboNames.OPENTHREE] > 1
      || count[ComboNames.CLOSEDFOUR] > 1
      || (count[ComboNames.CLOSEDFOUR] > 0 && count[ComboNames.OPENTHREE] > 1)
    ) {
      score += 10000;
    }
    if (count[ComboNames.CLOSEDFOUR] > 0) {
      score += 1000
    }
    if (count[ComboNames.CLOSEDTHREE] > 0) {
      score += 300 * count[ComboNames.CLOSEDTHREE]
    }
    return score
  }

  generateActions(dilation: number = 1) {
    const board = this.boards.max.orig | this.boards.min.orig;
    let moves = board;
    for (let i = dilation; i > 0; i--) {
      moves = moves
        | (moves >> this.shift.hor)
        | (moves >> this.shift.vert)
        | (moves >> this.shift.diagSW)
        | (moves >> this.shift.diagSE);
    }
    moves ^= board;
    let i = 0;
    while (moves) {
      if (moves & 1n) {
        this.possibleActions.push(new Action(i % this.size, Math.floor(i / this.size)));
      }
      moves >>= 1n;
      i++;
    }
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
