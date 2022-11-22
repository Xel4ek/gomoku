import { IBoard } from '../../interfaces/IBoard';
import { isNumber } from '@taiga-ui/cdk';

class Point {
  row = -1;
  col = -1;
}

export class Move {
  score = NaN;
  s = '';
  row = -1;
  col = -1;
  idx: number;
  red = NaN;
  blue = NaN;
  i = -1;
  ch: Move[] = [];
  prun = false;
  board?: IBoard;
  size = 19;

  constructor(pointOrIndex: { row: number; col: number } | number) {
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
