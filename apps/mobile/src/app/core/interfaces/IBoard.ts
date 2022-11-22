import { Move } from '../ai/board/move';

export interface IBoard {
  score: number;
  scoreRed: number;
  scoreBlue: number;
  size: number;

  moveList(config: { useRandomMoveOrder: boolean }): Move[];

  checkMoves(): boolean;
}
