import {Strategy} from "./strategy";
import {GameBoard} from "./ai.service";
import {ScoringService} from "./scoring.service";
import {BitBoardService} from "../board/bit-board.service";
import {ActionService} from "./action.service";
import {LoggerService} from "../logger/logger.service";
import {PatternService} from "../board/pattern.service";
import {BoardBits} from "../board/boardBits";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root',
})

export class NegamaxStrategy implements Strategy{

  depth = 3;

  constructor(
    private readonly scoringService: ScoringService,
    private readonly boardService: BitBoardService,
    private readonly actionService: ActionService,
    private readonly logger: LoggerService,
    private readonly patternService: PatternService,
  ) {
  }

  negamax(node: BoardBits, depth: number, color: number): number {
    this.boardService.generateBoards(node, 1, color === 1 ? "red" : "blue");
    if (depth === 0 || node.childBoards.length === 0) {
      return color * this.scoringService.calculate(node)
    }
    let value = Number.NEGATIVE_INFINITY;
    node.childBoards.forEach(v => {
      value = Math.max(value, -this.negamax(v, depth - 1, -color))
    })
    return value;
  }

  getNextTurn(gameBoard: GameBoard): number {
    const board = this.boardService.createFromGameBoard(gameBoard);
    const start = performance.now();
    this.patternService.counter = 0;
    this.negamax(board, this.depth, 1);
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
