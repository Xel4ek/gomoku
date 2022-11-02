import { Strategy } from "./strategy";
import { GameBoard } from "../../interfaces/gameBoard";
import { TypedTree } from "../../tools/typed-tree";
import { IBoard } from "../../interfaces/IBoard";
import { Injectable } from "@angular/core";
import { BoardMatrix } from "../board/board-matrix";
import { MatrixScoringService } from "../matrix-service/matrix-scoring.service";

@Injectable({
  providedIn: 'root',
})
export class NegamaxGenericStrategy<T extends IBoard> implements Strategy {

  depth = 3;

  constructor(private readonly scoringService: MatrixScoringService) {
  }

  negamax(node: TypedTree<IBoard>, depth: number, alpha: number, beta: number, color: number): TypedTree<IBoard> {
    if (depth === 0) {
      node.value.score = color * this.scoringService.evaluateNode(node.value, color === 1 ? "red" : "blue");
      return node;
    }
    const moves = node.value.generateMoves(1, color === 1 ? "red" : "blue");
    if (moves.length === 0) {
      node.value.score = color * this.scoringService.evaluateNode(node.value, color === 1 ? "red" : "blue");
      return node;
    }
    //TODO: implement moves ordering here
    let value = Number.NEGATIVE_INFINITY;
    for (let i in moves) {
      const tempBoard = new BoardMatrix(undefined, node.value);
      tempBoard.move(moves[i].j, moves[i].i, color === 1 ? "red" : "blue");
      tempBoard.lastMove = moves[i];
      const childNode = new TypedTree<IBoard>(tempBoard);
      node.appendChild(childNode);
      this.negamax(childNode, depth - 1, -beta, -alpha, -color);
      if (childNode.value.score > value) {
        value = childNode.value.score;
        node.selectedChild = Number(i);
        node.value.score = value;
      }
      alpha = alpha >= value ? alpha : value;
      if (alpha >= beta) {
        break;
      }
    }
    return node;
  }

  createInstance<A extends IBoard>(board: GameBoard, c: new (a: GameBoard) => A): A {
    return new c(board);
  }

  getNextTurn(board: GameBoard): number {
    const concreteBoard = this.createInstance(board, BoardMatrix);
    const node = new TypedTree(concreteBoard);
    this.negamax(node, this.depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 1);
    const selectedMove = node.children[node.selectedChild].value.lastMove;
    return selectedMove ? selectedMove.i * node.value.size + selectedMove.j : -1;
  }
}
