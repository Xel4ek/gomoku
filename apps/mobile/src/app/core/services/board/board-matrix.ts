import { Board } from './board';
import { GameBoard } from '../../interfaces/gameBoard';
import { Color, EColor } from '../../color';
import { Move } from './move';
import { IBoard } from '../../interfaces/IBoard';

export class BoardMatrix extends Board {
  board: number[][] = [];
  movesBlue: number[] = [];
  movesRed: number[] = [];

  constructor(gameBoard?: GameBoard, boardMatrix?: IBoard) {
    super();
    if (gameBoard) {
      this.createEmptyBoard();
      gameBoard.player.map.forEach((v) =>
        this.move(this.col(v), this.row(v), EColor.BLUE)
      );
      gameBoard.enemy.map.forEach((v) =>
        this.move(this.col(v), this.row(v), EColor.RED)
      );
      Object.assign(this.movesBlue, gameBoard.player.map);
      Object.assign(this.movesRed, gameBoard.enemy.map);
    }
    if (boardMatrix instanceof BoardMatrix) {
      this.board = [];
      boardMatrix.board.forEach((v) => this.board.push(Object.assign([], v)));
      Object.assign(this.movesBlue, boardMatrix.movesBlue);
      Object.assign(this.movesRed, boardMatrix.movesRed);
    }
  }

  row(index: number): number {
    return Math.floor(index / this.size);
  }

  col(index: number): number {
    return index % this.size;
  }

  gameBoardToMatrix(gameBoard: GameBoard) {
    for (const i of gameBoard.player.map) {
      this.board[Math.floor(i / this.size)][i % this.size] = 1;
    }
    for (const i of gameBoard.enemy.map) {
      this.board[i % this.size][Math.floor(i / this.size)] = 2;
    }
  }

  indexToMove(index: number): Move {
    return new Move(Math.floor(index / this.size), index % this.size);
  }

  adjacentCells(index: number): number[] {
    const moves: number[] = [];
    [
      -1,
      1,
      this.size + 1,
      this.size,
      this.size - 1,
      -this.size - 1,
      -this.size + 1,
      -this.size,
    ].map((shift) => {
      const checkIndex = index + shift;
      if (
        checkIndex >= 0 &&
        checkIndex <= this.size * this.size &&
        Math.abs((index % this.size) - (checkIndex % this.size)) <= 1 &&
        this.board[Math.floor(checkIndex / this.size)][
          checkIndex % this.size
        ] === 0
      ) {
        moves.push(checkIndex);
      }
    });
    return moves;
  }

  generateMoves(dilation: number, color: Color): Move[] {
    throw new Error('mark to remove');
    const moveList: Move[] = [];
    const moveIndexes: number[] = [];
    const occupied = this.movesBlue.concat(this.movesRed);
    occupied.map((value) => {
      moveIndexes.push(...this.adjacentCells(value));
    });

    // this.olgGenerateMoves(moveList);
    const unique = new Set(moveIndexes);
    unique.forEach((v) => moveList.push(this.indexToMove(v)));
    return moveList;
  }

  private olgGenerateMoves(moveList: Move[]) {
    // Look for cells that has at least one stone in an adjacent cell.
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        //skip empty
        if (this.board[i][j] > 0) continue;

        if (i > 0) {
          if (j > 0) {
            if (this.board[i - 1][j - 1] > 0 || this.board[i][j - 1] > 0) {
              moveList.push(new Move(i, j));
              continue;
            }
          }
          if (j < this.size - 1) {
            if (this.board[i - 1][j + 1] > 0 || this.board[i][j + 1] > 0) {
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
            if (this.board[i + 1][j - 1] > 0 || this.board[i][j - 1] > 0) {
              moveList.push(new Move(i, j));
              continue;
            }
          }
          if (j < this.size - 1) {
            if (this.board[i + 1][j + 1] > 0 || this.board[i][j + 1] > 0) {
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
  }

  aiMove(posX: number, posY: number, color: EColor, findCaptures: boolean) {
    if (findCaptures) {
      this.capture(color);
    }
    this.board[posY][posX] = color;
  }

  move(posX: number, posY: number, color: EColor) {
    this.board[posY][posX] = color;
  }

  unmove(posX: number, posY: number) {
    this.board[posX][posY] = EColor.EMPTY;
  }

  private capture(color: EColor) {
    const captures = this.findCaptures(color);
    for (const i of captures) {
      this.unmove(Math.floor(i / this.size), i % this.size);
    }
  }

  private findCaptures(side: EColor, delta: number = 3): number[] {
    const player: number[] = [];
    const enemy: number[] = [];
    this.board.map((x, xi) => {
      x.map((y, yi) => {
        y === side
          ? player.push(xi * this.size + yi)
          : y != 0
          ? enemy.push(xi * this.size + yi)
          : null;
      });
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
    this.board = Array.from({ length: this.size }, (_) =>
      Array.from({ length: this.size }, (_) => 0)
    );
  }

  generateBoards(dilation: number, side: Color): IBoard[] {
    throw new Error('Not implemented');
  }

  moveList({ useRandomMoveOrder }: { useRandomMoveOrder: boolean }): Move[] {
    const moveList = [
      ...new Set<number>(
        this.movesBlue
          .concat(this.movesRed)
          .map((i) => this.adjacentCells(i))
          .flat()
      ),
    ];
    if (useRandomMoveOrder) {
      moveList.sort(() => Math.random() - 0.5);
    }
    return moveList.map((i) => this.indexToMove(i));
  }
}
