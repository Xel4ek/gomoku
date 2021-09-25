import { Board } from "./board";

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(9);
  });

  it('should be random', () => {
    board.generateRandomMatrix();
    expect(board.matrix.every(row => row.every(value => typeof [-1, 0 ,1].indexOf(value) != 'undefined'))).toBeTruthy();
  });

  it('should generate actions', () => {
    board.move(board.nextWhiteMove, 1, 1)
    expect(board.generateActions(3).length).toBeGreaterThan(0);
  });

  it('should change move to black', () => {
    board.move(true, 3, 3);
    expect(board.nextWhiteMove).toBeFalsy();
  });

});
