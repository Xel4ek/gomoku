import { GameBoard } from "../services/ai/ai.service";

export interface IAi {

  getNextAction(board: GameBoard, callback: (turn: number) => void): void
}
