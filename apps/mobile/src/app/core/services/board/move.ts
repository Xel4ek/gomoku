export class Move {
  row: number;
  col: number;
  idx: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
    this.idx = this.index();
  }

  index() {
    return this.row * 19 + this.col;
  }
}