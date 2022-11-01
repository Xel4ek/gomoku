import { Board } from "./board";
import { GameBoard } from "../../interfaces/gameBoard";
import { Color } from "../../color";
import { Move } from "./move";
import { IBoard } from "../../interfaces/IBoard";

export class BoardMatrix extends Board implements IBoard {

  board: number[][] = [];

  constructor(gameBoard?: GameBoard, boardMatrix?: IBoard) {
    super();
    if (gameBoard) {
      this.createEmptyBoard();
      gameBoard.player.map.forEach(v => this.addStoneNoGUI(this.col(v), this.row(v), "blue"));
      gameBoard.enemy.map.forEach(v => this.addStoneNoGUI(this.col(v), this.row(v), "red"));
      // for (let i: number = 0; i < this.size; i++) {
      //   this.board[i] = [];
      //   for (let j: number = 0; j < this.size; j++) {
      //     this.board[i][j] = 0;
      //   }
      //   this.gameBoardToMatrix(gameBoard);
      // }
    }
    if (boardMatrix instanceof BoardMatrix) {
      this.board = Array(this.size);
      boardMatrix.board.forEach((value, index) => this.board[index] = Array.from(value))
    }
  }

  row(index: number): number {
    return Math.floor(index / this.size);
  }

  col(index: number): number {
    return index % this.size;
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

  addStoneNoGUI(posX: number, posY: number, color: Color) {
    this.board[posY][posX] = color === "red" ? 2 : 1;
  }

  private createEmptyBoard() {
    this.board = Array.from({length: this.size}, _ => Array.from({length: this.size}, _ => 0));
  }

}
