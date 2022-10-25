import { Tree } from "ts-tree";

export class TypedTree<T> extends Tree {
  selectedMove?: number;
  selectedChild = NaN;
  private _value: T;

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
