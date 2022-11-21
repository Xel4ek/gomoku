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

  // negamaxShort(board: IBoard, depth: number, alpha: number, beta: number, color: number): IBoard {
  //   if (depth === 0 || !board.checkMoves()) {
  //     this.scoringService.evaluateNode(board, color);
  //     node.value.score = color * board.score;
  //     return board;
  //   }
  //   node.moves = node.value.moveList(this.config);
  //   let value = Number.NEGATIVE_INFINITY;
  //   for (const move in node.moves) {
  //     const a = -this.negamaxShort(child, depth - 1, -beta, -alpha, -color);
  //     value = [value, a].reduce((acc, cur) => Math.max(acc, cur));
  //     alpha = Math.max(alpha, value);
  //     if (alpha >= beta) {
  //       break;
  //     }
  //   }
  // }

  negamax(
    node: TypedTree<IBoard>,
    depth: number,
    alpha: number,
    beta: number,
    color: number
  ): void {
    this.negamaxOld(node, depth,alpha, beta,color);
    // this.negamaxShort(node.value, depth, alpha, beta, color);
  }

  negamaxOld(
    node: TypedTree<IBoard>,
    depth: number,
    alpha: number,
    beta: number,
    color: number
  ): TypedTree<IBoard> {
    if (depth === 0) {
      this.scoringService.evaluateNode(
        node.value,
        color === 1 ? EColor.BLUE : EColor.RED
      );
      node.value.score = color * node.value.score;
      return node;
    }
    node.moves = node.value.moveList(this.config);
    if (node.moves.length === 0) {
      this.scoringService.evaluateNode(
        node.value,
        color === 1 ? EColor.BLUE : EColor.RED
      );
      node.value.score = color * node.value.score;
      console.error(node);
      return node;
    }
    this.treeCapacity += node.moves.length;
    let value = Number.NEGATIVE_INFINITY;
    for (const i in node.moves) {
      ++this.count;
      const tempBoard = new BoardMatrix(undefined, node.value);
      tempBoard.aiMove(
        node.moves[i].col,
        node.moves[i].row,
        color === 1 ? EColor.RED : EColor.BLUE,
        this.config.findCaptures
      );
      tempBoard.lastMove = node.moves[i];
      const childNode = new TypedTree<IBoard>(tempBoard);
      node.appendChild(childNode);
      if (this.scoringService.checkWin(childNode.value, color === 1 ? EColor.BLUE : EColor.RED)) {
        node.value.score = color * 10000000;
        node.selectedChild = Number(i);
        return node;
      }
      else {
        this.negamax(childNode, depth - 1, -beta, -alpha, -color);
      }
      if (-childNode.value.score > value) {
        value = -childNode.value.score;
        node.selectedChild = Number(i);
        node.value.score = value;
        node.value.scoreBlue = childNode.value.scoreBlue;
        node.value.scoreRed = childNode.value.scoreRed;
      }
      node.moves[i].score = -childNode.value.score;
      node.moves[i].red = childNode.value.scoreRed;
      node.moves[i].blue = childNode.value.scoreBlue;
      node.moves[i].ch = node.children[node.selectedChild].moves;
      alpha = alpha >= value ? alpha : value;
      if (alpha >= beta) {
        node.moves[node.selectedChild].prun = true;
        break;
      }
    }
    node.moves[node.selectedChild].s = '-->';
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
    // node.moves.sort((a: Move, b: Move) => (a.row < b.row ? -1 : 1));
    const board1 = node.value;
    
    
    return {
      count: this.count,
      capacity: this.treeCapacity,
      turn: selectedMove ? selectedMove.index() : -1,
    };
  }

  printMoves(level: number, node: TypedTree<IBoard>, color: EColor): number[][] {
    const tempBoard = new BoardMatrix(undefined, node.value);
    node.moves.map(m => tempBoard.board[m.row][m.col] = EColor.RED ? 3 : 8);
    return tempBoard.board;
  }

}
