import {BoardBits} from "../board/boardBits";

export abstract class Tree<T> {
  protected _wasVisited = false

  get wasVisited(): boolean {
    return this._wasVisited
  }
}

export class Leaf<T> extends Tree<T> {
  public constructor(readonly _value: T) {
    super()
  }

  get value(): T {
    this._wasVisited = true
    return this._value
  }
}

export class Node<T> extends Tree<T> {
  public constructor(readonly _children: Tree<T>[]) {
    super()
  }

  get children(): Tree<T>[] {
    this._wasVisited = true
    return this._children
  }
}

export abstract class GeneratedTree<T> extends Tree<T>{

  protected _depth: number;
  protected _level: number;
  protected _generator: () => T;

  constructor(generator: () => T, depth: number, level: number) {
    super();
    this._generator = generator;
    this._depth = depth;
    this._level = level;
  }


}
