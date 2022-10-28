import { Strategy } from "./strategy";
import { GameBoard } from "../../interfaces/gameBoard";
import { TypedTree } from "../../tools/typed-tree";
import { IBoard } from "../../interfaces/IBoard";
import { Injectable } from "@angular/core";
import { SimpleScoringService } from "../simple-scoring/simple-scoring.service";
import { BoardMatrix } from "../board/board-matrix";

@Injectable({
  providedIn: 'root',
})
export class NegamaxGenericStrategy<T extends IBoard> implements Strategy {

  depth = 3;

  constructor(private readonly scoringService: SimpleScoringService) {
  }

  negamax(node: TypedTree<IBoard>, depth: number, alpha: number, beta: number, color: number): TypedTree<IBoard> {
    if (depth === 0) {
      node.value.score = color * this.scoringService.evaluateNode(node, color === 1 ? "red" : "blue");
      return node;
    }
    node.value.generateBoards(1, color === 1 ? "red" : "blue").forEach((_) => node.appendChild(new TypedTree(_)));
    if (node.children.length === 0) {
      node.value.score = color * this.scoringService.evaluateNode(node, color === 1 ? "red" : "blue");
      return node;
    }
    //TODO: implement moves ordering here
    let value = Number.NEGATIVE_INFINITY;
    for (let i in node.children) {
      const childNode = this.negamax(node.children[i], depth - 1, -beta, -alpha, -color);
      childNode.value.score = -(isNaN(childNode.value.score) ? childNode.children[node.selectedChild].value.score : childNode.value.score);
      childNode.value.scoreRed = -(isNaN(childNode.value.scoreRed) ? childNode.children[node.selectedChild].value.scoreRed : childNode.value.scoreRed);
      childNode.value.scoreBlue = -(isNaN(childNode.value.scoreBlue) ? childNode.children[node.selectedChild].value.scoreBlue : childNode.value.scoreBlue);
      if (childNode.value.score > value) {
        value = childNode.value.score;
        node.selectedChild = Number(i);
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
    return node.selectedMove ?? -1;
  }
}
