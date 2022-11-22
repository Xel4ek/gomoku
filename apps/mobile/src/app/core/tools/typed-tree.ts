import { Tree } from 'ts-tree';
import { Move } from '../ai/board/move';

export class TypedTree<T> extends Tree {
  selectedChild = NaN;

  constructor(node: T) {
    super();
    this._value = node;
  }

  private _value: T;

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }

  private _moves: Move[] = [];

  get moves(): Move[] {
    return this._moves;
  }

  set moves(value: Move[]) {
    if (value.length === 0) {
      console.error('empty');
    }
    this._moves = value;
  }

  private _isTerminal = true;

  get isTerminal(): boolean {
    this.value;
    return this._isTerminal;
  }

  set isTerminal(value: boolean) {
    this._isTerminal = value;
  }

  appendChild(newTree: this): this {
    return super.appendChild(newTree);
  }
}
