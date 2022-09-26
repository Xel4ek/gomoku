import { GameBoard } from "./gameBoard";

export interface IAi {

  getNextAction(board: GameBoard, callback: (turn: number) => void): void
}
