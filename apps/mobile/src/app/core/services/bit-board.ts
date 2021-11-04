import { GameBoard } from "./ai/ai.service";
import { Action } from "./action";

export class InvalidMoveError extends Error {
}

interface Direction {
  [prop: string]: bigint,

  N: bigint,
  NE: bigint,
  NW: bigint,
  W: bigint,
  E: bigint,
  S: bigint,
  SW: bigint,
  SE: bigint,
}

export enum Dir {
  E,
  S,
  SE,
  SW
}

export enum ComboNames {
  FIVE,
  OPENFOUR,
  CLOSEDFOUR,
  OPENTHREE,
  CLOSEDTHREE,
}

export interface Combo {
  name: string,
  type: ComboNames,
  maskP: bigint,
  maskO: bigint,
  masksP: bigint[],
  masksO: bigint[],
  cols: number,
  rows: number,
}

export class GameBoard1 {

}

export class BitBoard {
  score: number;
  size: number;
  shift: Direction;
  boards = {
    empty: 0n,
    max: 0n,
    min: 0n,
  };
  combinations: Combo[] = [
    {
      name: "Open Five",
      type: ComboNames.FIVE,
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
// {
//     three1: BigInt("0b111"),
//     three2: BigInt("0b1101"),
//     three3: BigInt("0b1011"),
//     three4: BigInt("0b10101"),
//     three5: BigInt("0b11001"),
//     three6: BigInt("0b10011"),
//   };
  ];
  player: "max" | "min";
  public possibleActions: Action[];

  static printBitBoard(board: bigint, size: number) {
    const matrix = [];
    const str = board.toString(2).split('').reverse();
    for (let row = 0; row < size; row++) {
      matrix.push(str
        .slice(row * (size + 1), (row + 1) * (size + 1)).join(''));
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

  static fromArray(arr: string[], size: number) {
    let board = 0n;
    arr.forEach(value => {
      const row = Math.floor(Number(value) / size)
      const col = Number(value) % size;
      const mask = 1n << BigInt(row * (size + 1) + col);
      board |= mask;
    });
    return board;
  }

  constructor(size?: number, gameBoard?: GameBoard) {
    this.possibleActions = [];
    this.score = 0;
    this.size = size ?? 19;
    this.boards.empty = BigInt("0b" + ("0" + "1".repeat(this.size)).repeat(this.size));
    if (gameBoard) {
      this.boards.max = BitBoard.fromArray(gameBoard.player, gameBoard.size);
      this.boards.min = BitBoard.fromArray(gameBoard.opp, gameBoard.size);
    }
    this.player = "max";
    //TODO: remove
    this.rotateCombos(this.combinations);
    this.setMasks(this.combinations);
    this.shift = {
      E: 1n,
      N: BigInt(this.size) + 1n,
      NE: (BigInt(this.size) + 1n) + 1n,
      NW: (BigInt(this.size) + 1n) - 1n,
      S: -(BigInt(this.size) + 1n),
      SE: -(BigInt(this.size) + 1n) + 1n,
      SW: -(BigInt(this.size) + 1n) - 1n,
      W: -1n,
    };
  }


  private setMasks(combos: Combo[]) {
    combos.forEach(combo => {
      let maskP = combo.maskP;
      let maskO = combo.maskO;
      for (let row = 0; row < (this.size - combo.rows); row++) {
        for (let col = 0; col <= (this.size - combo.cols); col++) {
          combo.masksP.push(maskP);
          combo.masksO.push(maskO);
          maskP <<= 1n;
          maskO <<= 1n;
        }
        maskP <<= BigInt(combo.cols + 1);
        maskO <<= BigInt(combo.cols + 1);
      }
    });
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

  clone(): BitBoard {
    const board = new BitBoard(this.size);
    board.boards.max = this.boards.max;
    board.boards.min = this.boards.min;
    return board;
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

  countBits(v: bigint) {
    let c: number;
    for (c = 0; v; c++) {
      v &= v - BigInt(1);
    }
    return c;
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
    const shift = BigInt(row * (this.size + 1) + col);
    console.log(row, col, shift);
    const moveMask = 1n << shift;
    this.checkMove(moveMask);
    if (isMax) {
      this.boards.max |= moveMask;
    } else {
      this.boards.min |= moveMask;
    }
    // this.nextWhiteMove = !this.nextWhiteMove;
    this.score = this.updateScore();
  }

  private checkMove(mask: bigint) {
    if (this.boards.max & mask || this.boards.min & mask) {
      throw new InvalidMoveError(`Cell occupied`);
    }
  }

  //TODO: implement update score
  private updateScore(boardP: bigint = this.boards.max, boardO: bigint = this.boards.min) {
    const match: Combo[] = [];
    this.combinations.forEach(combo => {
      combo.masksP.forEach(((value, index) => {
        if ((value & boardP) === value
          && (combo.masksO[index] & boardO) === combo.masksO[index]) {
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
      [ComboNames.FIVE]: 0,
      [ComboNames.OPENFOUR]: 0,
      [ComboNames.CLOSEDFOUR]: 0,
      [ComboNames.OPENTHREE]: 0,
      [ComboNames.CLOSEDTHREE]: 0,
    };
    combos.forEach(value => {
      count[value.type] += 1;
    });
    let score = 0;
    if (count[ComboNames.FIVE] > 0) {
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
      score += 1000;
    }
    if (count[ComboNames.CLOSEDTHREE] > 0) {
      score += 300 * count[ComboNames.CLOSEDTHREE];
    }
    return score;
  }

  generateActions(dilation: number = 1) {
    const occupied = this.boards.max | this.boards.min;
    let moves = occupied;
    console.log(BitBoard.printBitBoard(moves, this.size));
    for (let i = dilation; i > 0; i--) {
      moves = moves
        | moves >> this.shift.S
        | moves >> this.shift.N
        | (moves >> this.shift.E & this.boards.empty)
        | (moves >> this.shift.NE & this.boards.empty)
        | (moves >> this.shift.SE & this.boards.empty)
        | (moves >> this.shift.NW & this.boards.empty)
        | (moves >> this.shift.SW & this.boards.empty)
        | (moves >> this.shift.W & this.boards.empty);
    }
    moves ^= occupied;
    console.log(BitBoard.printBitBoard(moves, this.size));
    let i = 0;
    while (moves) {
      if (moves & 1n) {
        this.possibleActions.push(new Action(i % (this.size + 1), Math.floor(i / (this.size + 1))));
      }
      moves >>= 1n;
      i++;
    }
  }

  checkWin(isMax: boolean): boolean {
    const winCombos = this.combinations.filter(value => value.type === ComboNames.FIVE);
    for (let i = 0; i < winCombos.length; i++) {
      for (let j = 0; j < winCombos[i].masksP.length; j++) {
        const board = isMax ? this.boards.max : this.boards.min;
        const mask = winCombos[i].masksP[j];
        if ((mask & board) === mask) {
          return true;
        }
      }
    }
    return false;
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
