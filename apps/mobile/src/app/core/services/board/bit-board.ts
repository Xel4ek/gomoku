import { GameBoard } from '../ai/ai.service';
import { Action } from '../ai/action';
import { BitComparer, Combo, ComboNames, Dir } from './combination';

export class InvalidMoveError extends Error {}

interface Direction {
  [prop: string]: bigint;

  N: bigint;
  NE: bigint;
  NW: bigint;
  W: bigint;
  E: bigint;
  S: bigint;
  SW: bigint;
  SE: bigint;
}

export class BitBoard {
  score: number;
  size: number;
  shift: Direction;
  boards = {
    empty: 0n,
    player: 0n,
    enemy: 0n,
  };
  player: 'max' | 'min';
  public possibleActions: Action[];
  combinations: Combo[];
  winPlayer = false;
  winEnemy = false;

  static printBitBoard(board: bigint, size: number) {
    const str = board.toString(2).split('').reverse();
    let lines = Math.floor(str.length / size);
    while (lines) {
      str.splice(lines * (size + 1), 0, '\n');
      lines--;
    }
    return str.join('');
  }

  static fromArray(arr: string[], size: number) {
    let board = 0n;
    arr.forEach((value) => {
      const row = Math.floor(Number(value) / size);
      const col = Number(value) % size;
      const mask = 1n << BigInt(row * (size + 1) + col);
      board |= mask;
    });
    return board;
  }

  static comparer(combo: Combo, board: bigint, mask: bigint): boolean {
    if (combo.comparer === BitComparer.ANY) {
      return (board & mask) > 0n;
    }
    if (combo.comparer === BitComparer.AND) {
      return (board & mask) === mask;
    }
    if (combo.comparer === BitComparer.NOT) {
      return (board & mask) === 0n;
    }
    return false;
  }

  constructor(combos: Combo[], size?: number, gameBoard?: GameBoard) {
    this.possibleActions = [];
    this.score = 0;
    this.size = size ?? 19;
    this.boards.empty = BigInt(
      '0b' + ('0' + '1'.repeat(this.size)).repeat(this.size)
    );
    if (gameBoard) {
      // this.boards.player = BitBoard.fromArray(gameBoard.player, gameBoard.size);
      // this.boards.enemy = BitBoard.fromArray(gameBoard.opp, gameBoard.size);
    }
    this.player = 'max';
    //TODO: remove
    this.shift = {
      E: 1n,
      N: BigInt(this.size) + 1n,
      NE: BigInt(this.size) + 1n + 1n,
      NW: BigInt(this.size) + 1n - 1n,
      S: -(BigInt(this.size) + 1n),
      SE: -(BigInt(this.size) + 1n) + 1n,
      SW: -(BigInt(this.size) + 1n) - 1n,
      W: -1n,
    };
    this.combinations = combos;
  }

  clone(): BitBoard {
    const board = new BitBoard(this.combinations, this.size);
    board.boards.player = this.boards.player;
    board.boards.enemy = this.boards.enemy;
    return board;
  }

  generateRandomMoves(moves: number) {
    Array(moves)
      .fill(0)
      .map(() => {
        for (;;) {
          try {
            // this.move(
            //   Math.floor(Math.random() * this.size),
            //   Math.floor(Math.random() * this.size)
            // );
            break;
          } catch (e) {
            return e;
          }
        }
      });
  }

  countBits(v: bigint) {
    let c: number;
    for (c = 0; v; c++) {
      v &= v - BigInt(1);
    }
    return c;
  }

  move(col: number, row: number, turn: 'player' | 'enemy') {
    if (col >= this.size || row >= this.size || col < 0 || row < 0) {
      throw new InvalidMoveError(`Cell out of board`);
    }
    const shift = BigInt(row * (this.size + 1) + col);
    const moveMask = 1n << shift;
    this.checkMove(moveMask);
    this.boards[turn] |= moveMask;
  }

  private checkMove(mask: bigint) {
    if (this.boards.player & mask || this.boards.enemy & mask) {
      throw new InvalidMoveError(`Cell occupied`);
    }
  }

  //TODO: implement update score
  updateScore() {
    const matchMax: Combo[] = [];
    const matchMin: Combo[] = [];
    this.combinations.forEach((combo) => {
      combo.masksP.forEach((value, index) => {
        if (
          (value & this.boards.player) === value &&
          BitBoard.comparer(combo, this.boards.enemy, combo.masksO[index])
        ) {
          matchMax.push(combo);
          console.log('PUSHED PLAYER COMBO', combo);
        }
        if (
          (value & this.boards.enemy) === value &&
          BitBoard.comparer(combo, this.boards.player, combo.masksO[index])
        ) {
          matchMin.push(combo);
          console.log('PUSHED ENEMY COMBO', combo);
        }
      });
    });
    const score = this.calculateScore(matchMax) - this.calculateScore(matchMin);
    if (score > 100000) {
      this.winPlayer = true;
    }
    if (score < -100000) {
      this.winEnemy = true;
    }
    return score;
  }

  private calculateScore(combos: Combo[]): number {
    type Scores = {
      [key: number]: number;
    };
    const count: Scores = {
      [ComboNames.FIVE]: 0,
      [ComboNames.OPENFOUR]: 0,
      [ComboNames.CLOSEDFOUR]: 0,
      [ComboNames.OPENTHREE]: 0,
      [ComboNames.CLOSEDTHREE]: 0,
    };
    combos.forEach((value) => {
      count[value.type] += 1;
    });
    let score = 0;
    if (count[ComboNames.FIVE] > 0) {
      score += 100000;
    }
    if (count[ComboNames.OPENFOUR] > 0) {
      score += 15000;
    }
    if (
      count[ComboNames.OPENTHREE] > 1 ||
      count[ComboNames.CLOSEDFOUR] > 1 ||
      (count[ComboNames.CLOSEDFOUR] > 0 && count[ComboNames.OPENTHREE] > 1)
    ) {
      score += 10000;
    }
    if (count[ComboNames.CLOSEDFOUR] > 0 || count[ComboNames.OPENTHREE] > 0) {
      score += 1000;
    }
    if (count[ComboNames.CLOSEDTHREE] > 0) {
      score += 300 * count[ComboNames.CLOSEDTHREE];
    }
    return score;
  }

  generateActions(dilation: number = 1) {
    const occupied = this.boards.player | this.boards.enemy;
    let moves = occupied;
    // console.log(BitBoard.printBitBoard(moves, this.size));
    for (let i = dilation; i > 0; i--) {
      moves =
        moves |
        ((moves >> this.shift.S) & this.boards.empty) |
        ((moves >> this.shift.N) & this.boards.empty) |
        ((moves >> this.shift.E) & this.boards.empty) |
        ((moves >> this.shift.NE) & this.boards.empty) |
        ((moves >> this.shift.SE) & this.boards.empty) |
        ((moves >> this.shift.NW) & this.boards.empty) |
        ((moves >> this.shift.SW) & this.boards.empty) |
        ((moves >> this.shift.W) & this.boards.empty);
    }
    moves ^= occupied;
    // console.log(BitBoard.printBitBoard(moves, this.size));
    let i = 0;
    while (moves) {
      if (moves & 1n) {
        this.possibleActions.push(
          new Action(i % (this.size + 1), Math.floor(i / (this.size + 1)))
        );
      }
      moves >>= 1n;
      i++;
    }
  }

  checkWinErosion(isMax: boolean) {
    const len: number[] = [];
    Object.keys(Dir).forEach((value) => {
      let length = 0;
      let bits = isMax ? this.boards.player : this.boards.enemy;
      while (bits) {
        bits &= bits >> this.shift[value];
        length++;
      }
      len.push(length);
    });
    return Math.max(...len);
  }

  checkWin(isMax: boolean): boolean {
    const winCombos = this.combinations.filter(
      (value) => value.type === ComboNames.FIVE
    );
    for (let i = 0; i < winCombos.length; i++) {
      for (let j = 0; j < winCombos[i].masksP.length; j++) {
        const board = isMax ? this.boards.player : this.boards.enemy;
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
