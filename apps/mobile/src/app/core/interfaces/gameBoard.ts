import { Player } from "./player";

interface AiStatistics {
  [key: string]: unknown;
}

export interface GameBoard {
  id: number;
  timestamp: number;
  player: Player;
  enemy: Player;
  blocked: number[];
  size: number;
  stat?: AiStatistics;
  winner?: {
    color: (opacity?: number) => string;
    combination: number[];
  };
}
