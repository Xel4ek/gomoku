import { Color } from "../color";

export interface IBoard {
  score: number;
  scoreRed: number;
  scoreBlue: number;
  size: number;

  generateBoards(dilation: number, side: Color): IBoard[];
  generateMoves(dilation: number, side: Color): number[];

}