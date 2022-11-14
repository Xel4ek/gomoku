import { Color } from '../color';
import { Move } from '../services/board/move';

export interface IBoard {
  score: number;
  scoreRed: number;
  scoreBlue: number;
  size: number;

  generateBoards(dilation: number, side: Color): IBoard[];
  generateMoves(dilation: number, side: Color): Move[];
  moveList(config: { useRandomMoveOrder: boolean }): Move[];
}
