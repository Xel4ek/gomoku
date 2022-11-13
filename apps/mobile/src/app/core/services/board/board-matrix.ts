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
    // this.capture(color);
    this.board[posY][posX] = color;
  }

  private capture(color: EColor) {
    const captures = this.findCaptures(color);
    for (let i of captures) {
      this.unmove(Math.floor(i / this.size), i % this.size);
    }
  }

  unmove(posX: number, posY: number) {
    this.board[posX][posY] = EColor.EMPTY;
  }

  private findCaptures(side: EColor, delta: number = 3): number[] {
    const player: number[] = [];
    const enemy: number[] = [];
    this.board.map((x, xi) => {
      x.map((y, yi) => {
        y === side ? player.push(xi * this.size + yi) : y != 0 ? enemy.push(xi * this.size + yi) : null;
      })
    });
    const toRemove: number[] = [];
    const size = 19;
    const pivot = player[player.length - 1];
    [-1, 1, size + 1, size, size - 1, -size - 1, -size + 1, -size].map(
      (coif) => {
        if (
          enemy.includes(pivot + coif) &&
          enemy.includes(pivot + 2 * coif) &&
          player.includes(pivot + 3 * coif)
        ) {
          toRemove.push(pivot + coif);
          toRemove.push(pivot + 2 * coif);
        }
      }
    );
    return toRemove;
  }

  private createEmptyBoard() {
    this.board = Array.from({length: this.size}, _ => Array.from({length: this.size}, _ => 0));
  }
}
