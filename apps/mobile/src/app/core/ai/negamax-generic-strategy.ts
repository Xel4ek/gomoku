import { IBoard } from '../interfaces/IBoard';
import { Strategy } from '../services/ai/strategy';
import { TypedTree } from '../tools/typed-tree';
import { EColor } from '../color';
import { BoardMatrix } from '../services/board/board-matrix';
import { GameBoard } from '../interfaces/gameBoard';
import { MatrixScoring } from './matrix-scoring-service';

export interface WorkerReport {
  count: number;
  turn: number;
  capacity: number;
  delta: number;
}

export class NegamaxGenericStrategy<T extends IBoard> implements Strategy {
  private static instance: Record<number, NegamaxGenericStrategy<any>> = {};
  count = 0;
  treeCapacity = 0;
  depth: number;
  private readonly scoringService = new MatrixScoring();
  private config = {
    findCaptures: true,
    useRandomMoveOrder: true,
  };

  private constructor(depth: number = 3) {
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
    const moves = node.value.moveList(this.config);
    if (moves.length === 0) {
      node.value.score =
        color *
        this.scoringService.evaluateNode(
          node.value,
          color === 1 ? EColor.RED : EColor.BLUE
        );
      return node;
    }
    this.treeCapacity += moves.length;
    let value = Number.NEGATIVE_INFINITY;
    for (const i in moves) {
      ++this.count;
      const tempBoard = new BoardMatrix(undefined, node.value);
      tempBoard.aiMove(
        moves[i].col,
        moves[i].row,
        color === 1 ? EColor.RED : EColor.BLUE,
        this.config.findCaptures
      );
      tempBoard.lastMove = moves[i];
      const childNode = new TypedTree<IBoard>(tempBoard);
      node.appendChild(childNode);
      if (this.scoringService.checkWin(childNode.value, color === 1 ? EColor.RED : EColor.BLUE)) {
        childNode.value.score = color * 1000000;
      } else {
        this.negamax(childNode, depth - 1, -beta, -alpha, -color);
      }
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

  getNextTurn(board: GameBoard): Omit<WorkerReport, 'delta'> {
    this.count = 0;
    this.treeCapacity = 0;
    if (!board.player.map.length && !board.enemy.map.length) {
      return {turn: 180, count: this.count, capacity: this.treeCapacity};
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
    return {
      count: this.count,
      capacity: this.treeCapacity,
      turn: selectedMove
        ? selectedMove.row * node.value.size + selectedMove.col
        : -1,
    };
  }
}
