import { Board } from "./board";

export class Action {
  score = 0;

  constructor(public col: number, public row: number) {
  }
}
