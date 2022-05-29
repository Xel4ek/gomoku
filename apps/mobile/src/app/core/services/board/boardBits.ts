import { Orientation } from "./bit-board.service";
import { Action, BoardAction } from "../ai/action";

export enum Field {
  RED = "red",
  BLUE = "blue",
  BORDER = "border",
}

export class BoardBits {
  //Little-Endian File-Rank mapping => A1, A2, A3...

  get sizeNumber() {
    return Number(this.size);
  }

  size: bigint;

  private _red = 0n;
  private _blue = 0n;
  private _border = 0n;
  possibleActions: BoardAction[] = [];
  childBoards: BoardBits[] = [];
  indexScore: {[index: number]: number} = {};
  orientation = Orientation.LEFR;
  firstCell = 1n;
  score = Number.NaN;
  _str: string;

  get red() {
    return this._red;
  }

  set red(board: bigint) {
    this._red = board;
  }

  get blue() {
    return this._blue;
  }

  set blue(board: bigint) {
    this._blue = board;
  }

  get border() {
    return this._border;
  }

  set border(board: bigint) {
    this._border = board;
  }

  //TODO: implement new border (21 x 21)
  //TODO: rotate border only to check its shape

  constructor(size: bigint, player: bigint, enemy: bigint, border: bigint) {
    this.size = BigInt(size);
    this._red = BigInt(player);
    this._blue = BigInt(enemy);
    this._border = BigInt(border);
    this._setFistCell()
    this._str = this._red.toString(32) + this._blue.toString(32)
  }

  shiftAll(size: number) {
    const s = BigInt(size);
    this._blue >>= s;
    this._red >>= s;
    this._border >>= s;
  }

  toString() {
    return this._red.toString(32) + this._blue.toString(32);
  }

  _setFistCell() {
    let border = this.border;
    border <<= 1n;
    while (border & 1n) {
      this.firstCell <<= 1n;
      border <<= 1n;
    }
  }

  update(field: Field, index: bigint, value: 0 | 1) {
    const mask = 1n << index;
    if (value) {
      this[field] |= mask;
    } else {
      this[field] &= ~mask;
    }
  }

  clone() {
    return new BoardBits(this.size, this.red, this.blue, this.border);
  }

  printBitBoard(board: 'red' | 'blue' | 'border') {
    const str = this[board].toString(2)
      .replaceAll("0", ".")
      .split('')
      .reverse()
      .map((value, index) => {
        if (index > 0 && index % Number(this.size) === 0) {
          value = '\n' + value
        }
        return value
      })
    return str.join('');
  }

}
