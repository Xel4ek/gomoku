import { GameBoard } from "../ai/ai.service";
import { Action } from "../ai/action";
import { Combo, ComboNames } from "./combination";

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

export class BitBoard {
  score: number;
  size: number;
  shift: Direction;
  boards = {
    empty: 0n,
    max: 0n,
    min: 0n,
  };
  player: "max" | "min";
  public possibleActions: Action[];
  combinations: Combo[];

  static printBitBoard(board: bigint, size: number) {
    const str = board.toString(2).split('').reverse();
    let lines = Math.floor(str.length / size);
    while (lines--) {
      str.splice(lines * (size + 1), 0, '\n')
    }
    return str.join('');
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

  constructor(combos: Combo[], size?: number, gameBoard?: GameBoard) {
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
    this.combinations = combos;

  }

  clone(): BitBoard {
    const board = new BitBoard(this.combinations, this.size);
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
        | (moves >> this.shift.S & this.boards.empty)
        | (moves >> this.shift.N & this.boards.empty)
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
