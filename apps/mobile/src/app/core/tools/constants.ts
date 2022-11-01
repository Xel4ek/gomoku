import { GameBoard } from "../interfaces/gameBoard";

export const GAMEBOARD: GameBoard = {
  id: 1,
  timestamp: 1649655174300,
  player: {
    type: 0,
    map: [],
    turn: [],
    captured: 0,
    options: {
      color: () => '',
      deep: 1,
    },
  },
  enemy: {
    type: 1,
    map: [],
    turn: [],
    captured: 0,
    options: {
      color: () => '',
      deep: 1,
    },
  },
  size: 19,
  blocked: [],
};
