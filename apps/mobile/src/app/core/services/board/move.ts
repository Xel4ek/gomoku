import { IBoard } from "../../interfaces/IBoard";
import { compareNumbers } from "@angular/compiler-cli/src/diagnostics/typescript_version";
import { Num } from "pts";
import { isNumber } from "@taiga-ui/cdk";

class Point {
  row: number = -1;
  col: number = -1;
}

export class Move {
  score: number = NaN;
  s = '';
  row: number = -1;
  col: number = -1;
  idx: number;
  red: number = NaN;
  blue: number = NaN;
  i = -1;
  ch: Move[] = [];
  prun: boolean = false;
  board?: IBoard;
  size = 19;

  constructor(pointOrIndex: { row: number, col: number } | number) {
    if (pointOrIndex instanceof Point) {
      this.row = pointOrIndex.row;
      this.col = pointOrIndex.col;
      this.idx = this.index();
    } else if (isNumber(pointOrIndex)) {
      this.idx = pointOrIndex;
      this.parseIndex(pointOrIndex);
    } else {
      throw RangeError;
    }
  }

  index() {
    return this.row * this.size + this.col;
  }

  parseIndex(index: number): void {
    this.row = Math.floor(index / this.size);
    this.col = index % this.size;
  }
}