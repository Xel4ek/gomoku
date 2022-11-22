import { IBoard } from '../../interfaces/IBoard';
import { Move } from './move';

export abstract class Board implements IBoard {
  score = NaN;
  scoreRed = NaN;
  scoreBlue = NaN;
  size = 19;
  lastMove?: Move;
  moves: Move[] = [];

  abstract moveList(config: { useRandomMoveOrder: boolean }): Move[];

  checkMoves(): boolean {
    return false;
  }
}
