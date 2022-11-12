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
    // nextTurn?: (
    //   board: GameBoard,
    //   callback: (board: number) => Promise<void>
    // ) => void;
    // workerFn?: (board: GameBoard) => number;
  };
}
