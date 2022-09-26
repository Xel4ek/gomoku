import { Color } from '../color';
import { BoardBits } from '../services/board/boardBits';

export interface Scoring {
  getScore(board: BoardBits, side: Color, turn: Color): number;
}
