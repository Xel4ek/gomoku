import { Color } from '../../color';
import { IBoard } from '../../interfaces/IBoard';
import { Move } from './move';

export abstract class Board implements IBoard {
  score = NaN;
  scoreRed = NaN;
  scoreBlue = NaN;
  size = 19;
  lastMove?: Move;
  moves: Move[] = [];

  abstract generateBoards(dilation: number, side: Color): IBoard[];

  abstract generateMoves(dilation: number, side: Color): Move[];

  abstract moveList(config: { useRandomMoveOrder: boolean }): Move[];

  checkMoves(): Boolean | boolean {
    return false;
  }
}
