import { Color } from '../color';
import { BoardBits } from '../services/board/boardBits';

export interface Scoring {
  evaluateBoard(board: BoardBits, turn: Color): number;
}
