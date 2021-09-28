import { Board } from "./board";

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(19);
  });

  it('should be random', () => {
    board.generateRandomMatrix();
    expect(board.matrix.every(value => [-1, 0, 1].includes(value))).toBeTruthy();
  });

  it('should move', () => {
    const oldBoard = board.maxPlayer;
    board.move(true, 5, 0);
    console.log(oldBoard.toString(2));
    console.log(board.maxPlayer.toString(2));
    expect(board.maxPlayer).not.toEqual(oldBoard);
  });

  it('should should throw Cell occupied Error', () => {
    board.move(true, 1, 1);
    expect(() => board.move(false, 1, 1)).toThrowError('Cell occupied');
  });

  it('should generate actions', () => {
    board.move(board.nextWhiteMove, 1, 1)
    board.generateActions(3);
    expect(board.possibleActions.length).toBeGreaterThan(0);
  });

  it('should change move to black', () => {
    board.move(true, 3, 3);
    expect(board.nextWhiteMove).toBeFalsy();
  });

  it('should generate board after 25 moves', () => {
    const moves = 25;
    board.generateRandomMoves(moves);
    console.log(board.toMatrix());
    expect(board.matrix.filter(value => [1, -1].includes(value)).length).toEqual(moves);
  });

  it('should return matrix', () => {
    board.generateRandomMoves(25);
    console.log(board.toMatrix());
    expect(typeof board.toMatrix()).toBe('String');

  });
});
