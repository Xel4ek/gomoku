import { Board } from "./board";
import { GameBoard } from "../../interfaces/gameBoard";
import { Color, EColor } from "../../color";
import { Move } from "./move";
import { IBoard } from "../../interfaces/IBoard";

export class BoardMatrix extends Board implements IBoard {

  board: number[][] = [];

  constructor(gameBoard?: GameBoard, boardMatrix?: IBoard) {
    super();
    if (gameBoard) {
      this.createEmptyBoard();
      gameBoard.player.map.forEach(v => this.move(this.col(v), this.row(v), EColor.BLUE));
      gameBoard.enemy.map.forEach(v => this.move(this.col(v), this.row(v), EColor.RED));
    }
    if (boardMatrix instanceof BoardMatrix) {
      this.board = []
      boardMatrix.board.forEach(v => this.board.push(Object.assign([], v)))
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

  move(posX: number, posY: number, color: EColor) {
    this.board[posY][posX] = color;
  }

  unmove(posX: number, posY: number) {
    this.board[posY][posX] = EColor.EMPTY;
  }

  private createEmptyBoard() {
    this.board = Array.from({length: this.size}, _ => Array.from({length: this.size}, _ => 0));
  }

}
