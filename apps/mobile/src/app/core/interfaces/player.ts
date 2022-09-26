import { PlayerType } from '../services/game/game.service';

export interface Player {
  type: PlayerType;
  map: number[];
  turn: number[];
  captured: number;
  options: {
    color: (opacity?: number) => string;
    deep: number;
  };
}
