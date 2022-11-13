export enum PlayerType {
  HUMAN = 'human',
  AI = 'ai',
}
export interface Player {
  type: PlayerType;
  map: number[];
  turn: number[];
  captured: number;
  color: string;
  options: {
    deep: number;
  };
  info: {
    sequence: {
      turn: number;
      delta: number;
    }[];
  };
}
