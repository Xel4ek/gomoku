import { Board } from "./board";
import { GameBoard } from "../../interfaces/gameBoard";
import { Color } from "../../color";
import { Move } from "./move";

export class BoardMatrix extends Board {

  board: number[][] = [];

  constructor(gameBoard: GameBoard) {
    super(gameBoard);
    for (let i: number = 0; i < this.size; i++) {
      this.board[i] = [];
      for (let j: number = 0; j < this.size; j++) {
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

  generateMoves(dilation: number, color: Color): Move[] {
    let moveList: Move[] = [];

    // Look for cells that has at least one stone in an adjacent cell.
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] > 0) continue;

        if (i > 0) {
          if (j > 0) {
            if (this.board[i - 1][j - 1] > 0 ||
              this.board[i][j - 1] > 0) {
              moveList.push(new Move(i, j));
              continue;
            }
          }
          if (j < this.size - 1) {
            if (this.board[i - 1][j + 1] > 0 ||
              this.board[i][j + 1] > 0) {
              moveList.push(new Move(i, j));
              continue;
            }
          }
          if (this.board[i - 1][j] > 0) {
            moveList.push(new Move(i, j));
            continue;
          }
        }
        if (i < this.size - 1) {
          if (j > 0) {
            if (this.board[i + 1][j - 1] > 0 ||
              this.board[i][j - 1] > 0) {
              moveList.push(new Move(i, j));
              continue;
            }
          }
          if (j < this.size - 1) {
            if (this.board[i + 1][j + 1] > 0 ||
              this.board[i][j + 1] > 0) {
              moveList.push(new Move(i, j));
              continue;
            }
          }
          if (this.board[i + 1][j] > 0) {
            moveList.push(new Move(i, j));
          }
        }

      }
    }
    return moveList;
  }
}
