import {Strategy} from "./strategy";
import {GameBoard} from "./ai.service";
import {ScoringService} from "./scoring.service";
import {BitBoardService} from "../board/bit-board.service";
import {ActionService} from "./action.service";
import {LoggerService} from "../logger/logger.service";
import {PatternService} from "../board/pattern.service";
import {BoardBits} from "../board/boardBits";
import {Injectable} from "@angular/core";
import memoize from "../../tools/memoize";

const acc: number[] = [];

const accDecorator = (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any => {
  console.log(acc);
  console.log(target);
  console.log(propertyKey);
  console.log(descriptor);
  acc.push(1);
  return descriptor;
}

@Injectable({
  providedIn: 'root',
})

export class NegamaxStrategy implements Strategy {

  depth = 3;

  constructor(
    private readonly scoringService: ScoringService,
    private readonly boardService: BitBoardService,
    private readonly actionService: ActionService,
    private readonly logger: LoggerService,
    private readonly patternService: PatternService,
  ) {
  }

  @accDecorator
  negamax(node: BoardBits, depth: number, alpha: number, beta: number, color: number) {
    this.boardService.generateBoards(node, 1, color === 1 ? "red" : "blue");
    if (depth === 0 || node.childBoards.length === 0) {
      node.score = color * this.scoringService.calculate(node)
      return node;
    }
    let value = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < node.childBoards.length; i++) {
      const childNode = this.negamax(node.childBoards[i], depth - 1, -beta, -alpha, -color);
      const score = isNaN(childNode.score) ? childNode.childBoards[childNode.selectedBoardIndex].score : childNode.score;
      childNode.score = score;
      if (score > value) {
        value = childNode.score;
        node.selectedBoardIndex = i;
      }
      alpha = alpha >= value ? alpha : value;
      if (alpha >= beta) {
        break;
      }
    }
    return node;
  }

  getNextTurn(gameBoard: GameBoard): number {
    const board = this.boardService.createFromGameBoard(gameBoard);
    const start = performance.now();
    this.patternService.counter = 0;
    this.negamax(board, this.depth, 0, 0, 1);
    const time = performance.now() - start;
    this.logger.log("Total time minimax: " + time);
    this.logger.log("Total calls patternService: " + this.patternService.counter);

    if (board.childBoards.length > 0) {
      const redMoveMask = board.childBoards[board.selectedBoardIndex].red ^ board.red;
      console.log(board);
      this.logger.log("Total time getNextTurn: " + (performance.now() - start));
      return this.boardService.getFieldIndex(board.border, redMoveMask);
    }
    return -1;
  }

}
