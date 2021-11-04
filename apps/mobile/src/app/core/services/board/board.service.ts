import { Injectable } from '@angular/core';
import { BitBoard } from "./bit-board";
import { Combination } from "./combination";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  store: BitBoard[] = [];
  currentBoard?: number;

  constructor() { }

  load(id: number) {
    this.currentBoard = id;
  }

  save() {
  }

  create(size: number) {
    const combos = new Combination(size);
    const board = new BitBoard(combos.combinations, size);
    this.currentBoard = this.store.push(board);
    board.move(Math.floor(size / 2), Math.floor(size / 2));
  }

  update(board: BitBoard) {
    if (this.currentBoard) {
      this.store[this.currentBoard] = board;
    }
  }
}
