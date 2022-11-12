import { PlayerType } from '../services/game/game.service';
import { GameBoard } from './gameBoard';

export interface Player {
  type: PlayerType;
  map: number[];
  turn: number[];
  captured: number;
  options: {
    color: (opacity?: number) => string;
    deep: number;
    nextTurn?: (
      board: GameBoard,
      callback: (board: number) => Promise<void>
    ) => void;
  };
}
