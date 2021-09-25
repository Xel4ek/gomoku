import { Board } from "./board";

export class Action {

  constructor(public col: number, public row: number, private board: Board) {
  }
}
