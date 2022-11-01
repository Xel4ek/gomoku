import { Color } from "../../color";
import { IBoard } from "../../interfaces/IBoard";
import { Move } from "./move";

export class Board implements IBoard {

  score = NaN;
  scoreRed = NaN;
  scoreBlue = NaN;
  size = 19;
  lastMove?: Move;

  generateBoards(dilation: number, side: Color): IBoard[] {
    throw Error("Not implemented");
  }

  generateMoves(dilation: number, side: Color): Move[] {
    throw Error("Not implemented");
  }

}