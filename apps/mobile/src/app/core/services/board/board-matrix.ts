import { Board } from "./board";
import { GameBoard } from "../../interfaces/gameBoard";
import { newArray } from "@angular/compiler/src/util";

export class BoardMatrix extends Board {

  board: number[][] = [];

  constructor(gameBoard: GameBoard) {
    super(gameBoard);
    for(let i: number = 0; i < this.size; i++) {
      this.board[i] = [];
      for(let j: number = 0; j< this.size; j++) {
        this.board[i][j] = 0;
      }
    }


    this.gameBoardToMatrix(gameBoard);
  }

  gameBoardToMatrix(gameBoard: GameBoard) {
    for (let i of gameBoard.player.map) {
      this.board[Math.floor(i / this.size)][i % this.size] = 1;
    }
    for (let i of gameBoard.enemy.map) {
      this.board[i % this.size][Math.floor(i / this.size)] = 2;
    }
  }

}
