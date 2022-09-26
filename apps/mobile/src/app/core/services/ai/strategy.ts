import { GameBoard } from "../../interfaces/gameBoard";

export interface Strategy {
  getNextTurn(board: GameBoard): number;
}
