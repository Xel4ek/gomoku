import { Color } from '../color';
import { BoardBits } from '../services/board/boardBits';
import { TypedTree } from "../tools/typed-tree";

export interface Scoring {
  evaluateBoard(board: BoardBits, turn: Color): number;

  evaluateNode(board: TypedTree<any>, turn: Color): number;
}
