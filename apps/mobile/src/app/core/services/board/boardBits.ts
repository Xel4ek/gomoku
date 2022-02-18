import { Orientation } from "./bit-board.service";
import { Action } from "../ai/action";

export enum Field {
  RED = "red",
  BLUE = "blue",
  BORDER = "border",
}

export class BoardBits {
  //Little-Endian File-Rank mapping => A1, A2, A3...

  size: bigint;

  private _red = 0n;
  private _blue = 0n;
  private _border = 0n;
  possibleActions: Action[] = [];
  orientation = Orientation.LEFR;
  firstCell = 1n;

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
    this.size = size;
    this._red = player;
    this._blue = enemy;
    this._border = border;
    this._setFistCell()
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
}
