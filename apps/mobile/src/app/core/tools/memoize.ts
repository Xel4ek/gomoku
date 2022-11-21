//TODO: caching not working fast enough

import { TypedTree } from "./typed-tree";
import { IBoard } from "../interfaces/IBoard";
import { Move } from "../services/board/move";

export function listMoves(node: TypedTree<IBoard>): Move[] {

  const moves = [];

  let tmpNode = node;

  while (!isNaN(tmpNode.selectedChild)) {
    moves.push(tmpNode.moves[tmpNode.selectedChild]);
    tmpNode = tmpNode.children[tmpNode.selectedChild];
  }

  return moves;

}

function memoize() {
  const cache = new Map();
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)  {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      let result;
      const key = args[0].toString();
      if (cache.has(key)) {
        result = cache.get(key);
        // 
      } else {
        result = originalMethod.apply(this, args);
        cache.set(key, result);
      }
      return result;
    }
  }
}

export default memoize;
