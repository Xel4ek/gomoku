import {GameBoard} from "./ai.service";

export interface Strategy {
  getNextTurn(board: GameBoard): number;
}
