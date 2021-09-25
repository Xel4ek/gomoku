import { Action } from './action';
import { Board } from "./board";

describe('Action', () => {
  it('should create an instance', () => {
    expect(new Action(1, 1, new Board(19))).toBeTruthy();
  });
});
