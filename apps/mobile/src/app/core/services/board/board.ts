import { Color } from "../../color";
import { IBoard } from "../../interfaces/IBoard";
import { GameBoard } from "../../interfaces/gameBoard";

export class Board implements IBoard {
  constructor(public gameBoard: GameBoard) {
  }

  score = NaN;
  scoreRed = NaN;
  scoreBlue = NaN;
  size = 19;

  generateBoards(dilation: number, side: Color): IBoard[] {
    throw Error("Not implemented");
  }

  generateMoves(dilation: number, side: Color): number[] {
    throw Error("Not implemented");
  }

}