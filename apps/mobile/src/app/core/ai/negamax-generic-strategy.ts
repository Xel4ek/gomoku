import { IBoard } from '../interfaces/IBoard';
import { Strategy } from '../services/ai/strategy';
import { TypedTree } from '../tools/typed-tree';
import { EColor } from '../color';
import { BoardMatrix } from '../services/board/board-matrix';
import { GameBoard } from '../interfaces/gameBoard';
import { MatrixScoring } from './matrix-scoring-service';

export class NegamaxGenericStrategy<T extends IBoard> implements Strategy {
  private static instance: Record<number, NegamaxGenericStrategy<any>> = {};
  count = 0;
  private readonly scoringService = new MatrixScoring();
  depth: number;
  private constructor(depth: number) {
    this.depth = depth;
  }
  static getStrategy<K extends IBoard>(depth: number) {
    if (!NegamaxGenericStrategy.instance[depth]) {
      NegamaxGenericStrategy.instance[depth] = new NegamaxGenericStrategy<K>(
        depth
      );
    }

    return NegamaxGenericStrategy.instance[depth] as NegamaxGenericStrategy<K>;
  }
  negamax(
    node: TypedTree<IBoard>,
    depth: number,
    alpha: number,
    beta: number,
    color: number
  ): TypedTree<IBoard> {
    if (depth === 0) {
      node.value.score =
        color *
        this.scoringService.evaluateNode(
          node.value,
          color === 1 ? EColor.RED : EColor.BLUE
        );
      return node;
    }
    const moves = node.value.generateMoves(1, color === 1 ? 'red' : 'blue');
    if (moves.length === 0) {
      node.value.score =
        color *
        this.scoringService.evaluateNode(
          node.value,
          color === 1 ? EColor.RED : EColor.BLUE
        );
      return node;
    }
    //TODO: implement moves ordering here
    let value = Number.NEGATIVE_INFINITY;
    for (const i in moves) {
      ++this.count;
      const tempBoard = new BoardMatrix(undefined, node.value);
      tempBoard.move(
        moves[i].col,
        moves[i].row,
        color === 1 ? EColor.RED : EColor.BLUE
      );
      tempBoard.lastMove = moves[i];
      const childNode = new TypedTree<IBoard>(tempBoard);
      node.appendChild(childNode);
      this.negamax(childNode, depth - 1, -beta, -alpha, -color);
      if (-childNode.value.score > value) {
        value = -childNode.value.score;
        node.selectedChild = Number(i);
        node.value.score = value;
        node.value.scoreBlue = childNode.value.scoreBlue;
        node.value.scoreRed = childNode.value.scoreRed;
      }
      alpha = alpha >= value ? alpha : value;
      if (alpha >= beta) {
        break;
      }
    }
    return node;
  }

  createInstance<A extends IBoard>(
    board: GameBoard,
    c: new (a: GameBoard) => A
  ): A {
    return new c(board);
  }

  getNextTurn(board: GameBoard): { turn: number; count: number } {
    this.count = 0;
    if (!board.player.map.length && !board.enemy.map.length) {
      return { turn: 180, count: this.count };
    }
    const concreteBoard = this.createInstance(board, BoardMatrix);
    const node = new TypedTree(concreteBoard);
    this.negamax(
      node,
      this.depth,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      1
    );
    const selectedMove = node.children[node.selectedChild].value.lastMove;
    return selectedMove
      ? {
          turn: selectedMove.row * node.value.size + selectedMove.col,
          count: this.count,
        }
      : { turn: -1, count: this.count };
  }
}
