export class Action {
  score = 0;

  constructor(public col: number, public row: number) {
  }
}

export class BoardAction extends Action {

  get mask() {
    return this._mask;
  }

  constructor(private readonly _size: number, private readonly _mask: bigint) {
    super(-1, -1)
  }
}
