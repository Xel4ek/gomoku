import { BoardBits } from "../board/boardBits";

export class Action {
  score = 0;

  constructor(public col: number, public row: number) {
  }
}


//TODO: remove row-col calculation from BoardAction. It should be only masked action. Row Col is only needed to
// return action to GameService and for debug purposes
export class BoardAction extends Action {

  private _index = -1;

  set index(value: number) {
    this._index = value;
  }

  get index() {
    // this.index = this.getFieldIndex(border, this.mask);
    return this._index;
  }

  get mask() {
    return this._mask;
  }


  constructor(private readonly _size: number, private readonly _mask: bigint, col: number, row: number) {
    super(col, row)
  }


  // getRowColFromIndex(index: number): {col: number, row: number} {
  //   return {col: index % Number(this.sizeField), row: Math.floor(index / Number(this.sizeField))}
  // }
}
