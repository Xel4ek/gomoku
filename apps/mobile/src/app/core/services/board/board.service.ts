import { Injectable } from '@angular/core';
import { BitBoard } from "./bit-board";
import { Combination } from "./combination";
import { GameBoard } from "../ai/ai.service";

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  store: BitBoard[] = [];
  currentBoard?: number;

  load(id: number) {
    this.currentBoard = id;
  }

  save() {
    throw "Not implemented";
  }

  create(size: number) {
    const combos = new Combination(size);
    const board = new BitBoard(combos.combinations, size);
    this.currentBoard = this.store.push(board);
    board.move(Math.floor(size / 2), Math.floor(size / 2), "player");
  }

  createFromGameBoard(gameBoard: GameBoard) {
    const combos = new Combination(gameBoard.size);
    return  new BitBoard(combos.combinations, undefined, gameBoard);
  }

  update(board: BitBoard) {
    if (this.currentBoard) {
      this.store[this.currentBoard] = board;
    }
  }
}
