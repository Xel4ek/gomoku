import { GameBoard } from "../../interfaces/gameBoard";

export interface Strategy {

  depth: number;

  getNextTurn(board: GameBoard): number;
}
