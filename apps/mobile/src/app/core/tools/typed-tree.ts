import { Tree } from "ts-tree";
import { Move } from "../services/board/move";

export class TypedTree<T> extends Tree {
  selectedChild = NaN;
  private _value: T;
  moves: Move[] = [];

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }

  constructor(node: T) {
    super();
    this._value = node;
  }
}
