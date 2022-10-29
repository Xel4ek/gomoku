import { BoardMatrix } from "./board-matrix";

describe('BoardMatrix', () => {
  const gameBoard = {
    id: 1,
    timestamp: 1649655174300,
    player: {
      type: 0,
      map: [101],
      turn: [1],
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


  it('should create an instance', () => {
    expect(new BoardMatrix(gameBoard)).toBeTruthy();
  });

  it('should generate moves', function () {
    expect(new BoardMatrix(gameBoard).generateMoves(1, "red").length).toEqual(8);

  });
});
